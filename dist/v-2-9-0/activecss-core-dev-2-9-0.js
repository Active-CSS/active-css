/*jslint browser: true */
/*global alert, console, getSelection, inspect, self, window  */

/***
	When compiling the core, this file always goes first, and _core-end.js always goes last.
	The sequence of the other files shouldn't matter - they should be just functions. They can be given a sequence if need dictates though.
	By doing a simple concatenate of core files we avoid using changeable imports and bloating the core. It's just a better solution.
	Plus we can easily dictate what version contains what files and enforce maintenance simplicity by organising directories for that.
	The compilation time to build the core for each change made is quick enough. Plus the compile tests highlight syntax errors right away.
	If you find your compile step is taking forever and annoying you, get a faster server. Mine is a cheap Optiplex 780 from 2006 and it's fast enough.
*/

(function (global, document) {
	'use strict';
	const ASYNCCOMMANDS = [
			'Ajax',
			'AjaxFormPreview',
			'AjaxFormSubmit',
			'AjaxPreGet',
			'FadeIn',
			'FadeOut',
			'FadeTo',
			'LoadAsAjax',
			'LoadConfig',
			'LoadScript',
			'LoadStyle'
		],
		CHILDRENREGEX = /\{\$CHILDREN\}/g,
		// Note: COLONSELS should be kept up-to-date with any new selector conditions/functions.
		// Don't forget that double backslashes are needed with quoted regexes.
		// Second line: word not followed by another name type character. 3rd line: word and opening parenthesis.
		// At some point this may be worth changing to a negative check based on config loaded conditionals.
		// If so, that would need to adjust according to loaded/removed config.
		COLONSELS = new RegExp('^(' +
			'(active|any\\-link|blank|checked|current|default|disabled|drop|empty|enabled|first\\-child|first\\-of\\-type|focus|focus\\-visible|focus\\-within|future|hover|indeterminate|in\\-range|invalid|last\\-child|last\\-of\\-type|link|local\\-link|only\\-child|only\\-of\\-type|optional|out\\-of\\-range|past|paused|placeholder\\-shown|playing|read\\-only|read\\-write|required|root|host|scope|target|target\\-within|user\\-error|user\\-invalid|valid|visited)(?![\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w_\\-])|' +
			'(current|dir|drop|has|is|lang|host\\-context|not|nth\\-column|nth\\-child|nth\\-last\\-child|nth\\-last\\-column|nth\\-last\\-of\\-type|nth\\-of\\-type|where)\\(' +
			')', 'g'),
		COMMENTS = /\/\*[\s\S]*?\*\/|(\t| |^)\/\/.*$/gm,
		CONDCOMMAND = /^[\u00BF-\u1FFF\u2C00-\uD7FF\w\-\!]+$/,
		CONDDEFSELF = [
			'if-empty',
			'if-checked',
			'if-completely-visible',
			'if-display',
			'if-empty',
			'if-empty-trimmed',
			'if-exists',
			'if-form-changed',
			'if-inner-html',
			'if-inner-text',
			'if-max-height',
			'if-max-length',
			'if-max-width',
			'if-min-height',
			'if-min-length',
			'if-min-width',
			'if-value',
			'if-visible'
		],
		DIGITREGEX = /^\d+$/,
		DYNAMICCHARS = {
			',': '_ACSS_later_comma',
			'{': '_ACSS_later_brace_start',
			'}': '_ACSS_later_brace_end',
			';': '_ACSS_later_semi_colon',
			':': '_ACSS_later_colon',
			'"': '_ACSS_later_double_quote'
		},
		INQUOTES = /("([^"]|"")*"|'([^']|'')*')/gm,
		LABELREGEX = /(label [\u00BF-\u1FFF\u2C00-\uD7FF\w]+)(?=(?:[^"]|"[^"]*")*)/gm,
		PARSEATTR = 3,
		PARSEDEBUG = 4,
		PARSEEND = 2,
		PARSELINEX = /([^\:]+):([^\;]*)(;)?/,
		PARSEREGEX = /((?!\*debugfile)[^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|((?!\*debugfile)[^\;\{\}]+\;(?!\s*\*\/))|(\*debugfile[\s\S]*?\*)/gmi,
		PARSESEL = 1,
		RANDHEX = 'ABCDEF',
		RANDNUMS = '0123456789',
		REGEXCHARS = /[\\^$.*+?\/()[\]{}|]/g,
		SELFREGEX = /\{\$SELF\}/g,
		WRAPSTATEMENTS = [ '@media', '@support' ],
		INNERSTATEMENTS = [ '@each', '@else', '@for', '@if', '@while' ],
		STYLEREGEX = /\/\*active\-var\-([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\: \[\]]+)\*\/(((?!\/\*).)*)\/\*\/active\-var\*\//g,
		SUPPORT_ED = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false),
		TABLEREGEX = /^\s*<t(r|d|body)/m,
		TIMEDREGEX = /(after|every) (0|stack|(\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\:\[\]]+(\})?(s|ms))(?=(?:[^"]|"[^"]*")*$)/gm,
		UNIQUEREF = Math.floor(Math.random() * 10000000);
	const STATEMENTS = [ ...INNERSTATEMENTS, ...WRAPSTATEMENTS ];
	const ATRULES = [ ...STATEMENTS, '@pages' ],		// @media and @support have a different handling to regular CSS at-rules.
		RANDCHARS = RANDHEX + 'GHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

	// Lodash vars for _get & _set. These are all vars in the original source.
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
		reIsPlainProp = /^\w*$/,
		rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
		INFINITY = 1 / 0,
		MAX_SAFE_INTEGER = 9007199254740991,
		reIsUint = /^(?:0|[1-9]\d*)$/,
		reEscapeChar = /\\(\\)?/g,
		_isArray = Array.isArray,
		objectProto = Object.prototype,
		defineProperty = (function() {
			try {
				var func = _getNative(Object, 'defineProperty');
				func({}, '', {});
				return func;
			} catch (e) {}
		}()),
		CLONE_DEEP_FLAG = 1;
	var hasOwnProperty = objectProto.hasOwnProperty;

	window.ActiveCSS = {};

	if (typeof module !== 'undefined') module.exports = ActiveCSS;	// This is for NPM.

	// Mark as ok when clean-up code is in place or isn't needed.
	var coreVersionExtension = '2-0-0',
		// Active CSS action commands.
		_a = {},
		_break = {},
		_continue = {},
		// Active CSS conditionals.
		_c = {},
		activeIDTrack = 0,
		actualDoms = {},
		ajaxResLocations = {},
		allEvents = [],
		autoStartInit = false,
		cancelIDArr = [],
		cancelCustomArr = [],
		clickOutsideSels = [],
		clickOutsideSet = false,
		compCount = 0,
		components = [],
		compPending = {},
		compParents = [],
		compPrivEvs = [],
		config = [],
		configArr = [],
		configBox = [],
		configFile = '',
		configLine = '',
		concatConfigCo = 0,
		concatConfigLen = 0,
		conditionals = [],
		currDocTitle = document.title,
		currUnderPage = '',
		currentPage = '',
		customTags = [],
		debuggerActive = false,
		debuggerCo = 0,
		debuggerEvs = [ 'afterLoadConfig' ],
		debuggerExtID = null,
		debuggerness = false,
		debugMode = '',
		delayArr = [],
		delaySync = {},
		devtoolsInit = [],
		doesPassive = false,
		elementObserver,
		elObserveTrack = [],
		evEditorExtID = null,
		evEditorActive = false,
		eventState = {},
		extractedCSS = {},		// CSS extraction temporary placeholder. Resets before each new CSS extraction. Style tags only generated after parsing of all files and tags has completed.
		exitTarget = {},
		flyCommands = [],
		flyConds = [],
		hashEventAjaxDelay = false,
		hashEvents = [],
		hashEventTrigger = false,
		idMap = [],
		immediateStopCounter = -1,
		imSt = [],
		initInlineLoading = false,
		inIframe = (window.location !== window.parent.location),
		inlineIDArr = [],
		intIDCounter = 0,
		labelData = [],
		labelByIDs = [],
		lazyConfig = '',
		localStoreVars = [],
		maEv = [],
		mainEventCounter = -1,
		masterConfigCo = 0,
		mediaQueries = [],
		mediaQueriesOrig = [],
		mimicClones = [],
		nonPassiveEvents = [],
		observeEventsQueue = {},
		observeEventsMid = {},
		pageList = [],
		pageWildcards = [],
		pageWildReg = [],
		parsedConfig = {},
		passiveEvents = true,
		preGetting = {},
		preGetMax = 6,
		preGetMid = 0,
		preSetupEvents = [],
		privVarScopes = [],
		resolvableVars = [],
		resolvingObj = {},
		reverseShadowEvs = {},
		// This is a map to information about the proxy variable. This is updated when variables are rendered, and stores location data to be updated
		// when the proxy target is modified.
		scopedData = [],
		// The variable containing the scoped variables that is proxied (using _observable-Slim) for detecting changes.
		scopedOrig = {},
		// This is the proxy and used as the variable manipulator in the core.
		scopedProxy = null,
		scriptTrack = [],
		selectors = [],
		sessionStoreVars = [],
		setupEnded = false,
		shadowSels = [],
		shadowDoms = {},
		shadowObservers = {},
		strictCompPrivEvs = [],
		strictPrivVarScopes = [],
		subEventCounter = -1,
		supportsShadow = true,
		syncQueue = [],
		taEv = [],
		targetEventCounter = -1,
		targetCounter = -1,
		userSetupStarted = false,
		varMap = [],
		varStyleMap = [],
		varInStyleMap = [],
		varReplaceRef = 0;

	ActiveCSS.customHTMLElements = {};

// Where's the end? Read the comments at the top.

_a.AddClass = o => {	// Note thisID is needed in case the "parent" selector is used.
	if (!_isConnected(o.secSelObj)) return false;
	ActiveCSS._addClassObj(o.secSelObj, o.actVal);
};

_a.AddHash = o => {
	o._addHash = true;
	_a.UrlChange(o);
};

_a.Ajax = o => {
	o.url = o.actVal.split(' ')[0]._ACSSRepQuo();
	_ajaxDo(o);
};

_a.AjaxFormPreview = o => {
	// as attrAjaxForm but with preview
	o.formPreview = true;
	_a.AjaxFormSubmit(o);
};

_a.AjaxFormSubmit = o => {
	o.formSubmit = true;
	const el = o.secSelObj;
	if (el) {
		o.url = el.action;
		_ajaxDo(o);
	} else {
		_err('Form not found', o);
	}
};

_a.AjaxPreGet = o => {
	// Pre-load the url, and stores the results in an array so we don't have to run the ajax command later.
	o.preGet = true;
	_a.Ajax(o);
};

_a.Alert = o => {
	alert(o.actVal._ACSSRepQuo());
};

_a.Blur = o => {
	if (!_isConnected(o.secSelObj)) return false;
	document.activeElement.blur();
};

_a.Break = o => {
	let breakPar = o.actVal.trim();
	if (DIGITREGEX.test(breakPar)) {
		_break['i' + o._imStCo] = breakPar.trim();
	} else {
		_err('Invalid break parameter', o);
	}
};

_a.CancelTimer = o => {
	// Delay action on a secSel by action or label.
	// This is scoped by document or specific shadow DOM or component.
	let val = o.actVal;
	let func = val._ACSSConvFunc();
	let found = true;
	let i, pos, intID, delayRef, loopref;
	let scope = (o.varScope) ? o.varScope : 'main';
	// It could be a label cancel. If the label exists, remove the delay.
	if (labelData[scope + val]) {
		// This is a label cancel. We know it is tied to a specific action value.
		// Format:
		// labelData[splitArr.lab] => { del: delayRef, func: o2.func, pos: o2.pos, o2.intID, tid: tid };
		// labelByIDs[tid] => { del: delayRef, func: o2.func, pos: o2.pos, o2.intID, lab: splitArr.lab };
		let delData = labelData[scope + val];
		_clearTimeouts(delayArr[delData.del][delData.func][delData.pos][delData.intID][delData.loopRef]);
		_removeCancel(delData.del, delData.func, delData.pos, delData.intID, delData.loopRef);
	} else {
		delayRef = _getDelayRef(o);
		if (!delayRef) return;
		if (delayArr[delayRef]) {
			if (val == 'all') {
				for (i in delayArr[delayRef]) {
					// Clear all timeout attributes for this selector, and the timeout itself.
					for (pos in delayArr[delayRef][i]) {
						for (intID in delayArr[delayRef][i][pos]) {
							for (loopref in delayArr[delayRef][i][pos][intID]) {
								_clearTimeouts(delayArr[delayRef][i][pos][intID][loopref]);
								_removeCancel(delayRef, i, pos, intID, loopref);
							}
						}
					}
				}
			} else {
				if (delayArr[delayRef] && delayArr[delayRef][func]) {
					// Clear all actions set up for this function.
					for (pos in delayArr[delayRef][func]) {
						for (intID in delayArr[delayRef][func][pos]) {
							for (loopref in delayArr[delayRef][func][pos][intID]) {
								_clearTimeouts(delayArr[delayRef][func][pos][intID][loopref]);
								_removeCancel(delayRef, func, pos, intID, loopref);
							}
						}
					}
				} else {
					found = false;
				}
			}
		} else {
			found = false;
		}
		if (!found) {
			// If it's not covered by the above selector, then it may be covered by some other cancel not directly tied to the Active ID.
			// Mark it for ignoring when the actual timeout hits.
			// Is there something about to hit this object? We need to check this, otherwise we are going to have an object that has a cancel-timer attached
			// but it may not need one. We could have marked the item as the point of delay, but there can be multiples of action values. We've got an a delay
			// event with the func, we just need to check all the o.secSels, which we can do. There are not going to be too many active cancel-delays in effect.
			// We use the data-activeid found from the results and compare with the delay array.
			// If cancel delaying an element or elements, get the data-activeid and see if it is in the delay array with the appropriate action we are
			// cancelling. If it is, we can add it. If not, then there is no need to add it.
			let activeIDArr = [];
			// Loop the secSels in the delayArr.
			Object.keys(delayArr).forEach(function(key) {
				if (['~', '|'].includes(key.substr(0, 1))) return;
				o.doc.querySelectorAll(key).forEach(function (obj, index) {
					activeIDArr.push(_getActiveID(obj));
				});
			});
			let activeID;
			if (typeof o.secSel == 'object') {
				// Only add it if there is an existing timeout scheduled for this action on this element.
				activeID = _getActiveID(o.secSel);
				if ((!cancelIDArr[activeID] || !cancelIDArr[activeID][func]) && activeIDArr.includes(activeID)) {
					_addCancelAttr(o.secSel, func);
				}
			} else {
				if (['~', '|'].includes(o.secSel.substr(0, 1))) {
					// If it's not in the delay arr we can ignore it.
					if (!delayArr[delayRef] || !delayArr[delayRef][func] || !delayArr[delayRef][func][o.actPos] || !delayArr[delayRef][func][o.actPos][o.intID] ||
						!delayArr[delayRef][func][o.actPos][o.intID][o.loopRef]) return;
					cancelCustomArr.push([o.secSel][func][o.actPos][o.intID][o.loopRef]);
				} else {
					o.doc.querySelectorAll(o.secSel).forEach(function (obj) {
						activeID = _getActiveID(obj);
						if ((!cancelIDArr[activeID] || !cancelIDArr[activeID][func]) && activeIDArr.includes(activeID)) {
							_addCancelAttr(obj, func);
						}
					});
				}
			}
		}
	}
};

_a.CancelTimerAll = o => {
	_unloadAllCancelTimer();
};

_a.ClickOnFirst = o => { _focusOn(o); };				//	First selector in list

_a.ClickOnLast = o => { _focusOn(o, 'l'); };			//	Last selector in list

_a.ClickOnNext = o => { _focusOn(o, 'n'); };			//	Next selector in list, or nothing

_a.ClickOnNextCycle = o => { _focusOn(o, 'nc'); };		//	Next selector in list, then cycles

_a.ClickOnPrevious = o => { _focusOn(o, 'p'); };		//	Previous selector in list

_a.ClickOnPreviousCycle = o => { _focusOn(o, 'pc'); };	//	Previous selector in list, then cycles

_a.ClickoutsideEvent = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let cid = _getActiveID(o.secSelObj);
	if (o.actVal.indexOf('true') !== -1) {
		clickOutsideSels[cid] = [];
		clickOutsideSels[cid][0] = true;
		clickOutsideSet = true;
		if (o.actVal.indexOf('continue') !== -1) {
			clickOutsideSels[cid][1] = true;
		}
	} else {
		if (clickOutsideSels[cid]) {
			clickOutsideSels[cid][0] = false;
			clickOutsideSet = false;
		}
	}
};

_a.Clone = o => {
	let el = _getSel(o, o.actVal);
	if (el) {
		if (el.tagName == 'IFRAME') {
			if (el.contentWindow.document.readyState != 'complete') {
				// Iframe not ready, come back to this in 200ms to clone.
				setTimeout(_a.Clone.bind(this, o), 200);
				return false;
			}
			let ref = _getActiveID(el);
			mimicClones[ref] = document.importNode(el.contentWindow.document.body, true);
		} else {
			let ref = _getActiveID(el);
			mimicClones[ref] = document.importNode(el, true);
		}
	}
};

_a.ConsoleLog = o => {
	let typeDesc = o.actVal._ACSSCapitalize() + ':';
	switch (o.actVal) {
		case 'target':
			console.log(typeDesc, o);
			return;
		case 'variables':
			console.log(typeDesc, scopedOrig);
			return;
		case 'conditionals':
			console.log(typeDesc, conditionals);
			return;
		case 'config':
			console.log(typeDesc, config);
			return;
		case 'components':
			console.log(typeDesc, components);
			return;
		case 'trace':
			console.trace();
			return;
	}
	// If it gets this far, send comma-delimited results to console.log().
	// Do necessary escaping before splitting by comma.

//console.log('_a.ConsoleLog, o.actVal:', o.actVal);

	let escapedCommas = _escCommaBrack(o.actVal, o);

//console.log('_a.ConsoleLog, escapedCommas:', escapedCommas);

	console.log(escapedCommas);

//	let wot = o.actVal._ACSSRepQuo();
//	// Split by comma.
//	let args = o.actVal.split(/\s*,\s*/);
//	// Iterate array and replace with real values for the content.
//	// Send result array to console.log.
//	console.log.apply(console, args);
};

_a.Continue = o => {
	let continuePar = o.actVal.trim();
	if (DIGITREGEX.test(continuePar)) {
		_continue['i' + o._imStCo] = continuePar.trim();
	} else {
		_err('Invalid continue parameter: "' + o.actVal + '"', o);
	}
};

_a.CopyToClipboard = o => {
	let el = _getSel(o, o.actVal);
	var arr = ['INPUT', 'TEXTAREA'];
	if (arr.indexOf(el.tagName) !== -1) {
		let rO = (el.getAttribute('readonly') == 'readonly');
		el.removeAttribute('readonly');
		el.select();
		document.execCommand('copy');
		if (rO) el.setAttribute('readonly', 'readonly');
	} else {
		let txt = document.createElement('textarea');
		txt.id = 'activecss-copy-field';
		txt.innerHTML = el.innerText;
		document.body.appendChild(txt);
		let docTxt = document.getElementById('activecss-copy-field');
		docTxt.select();
		document.execCommand('copy');
		ActiveCSS._removeObj(docTxt);
	}
};

_a.CreateCommand = o => {
	// Create an Active CSS command dynamically.
	let funcName = o.actVal.split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.

	if (_a[funcName]) return;	// If this command already exists, do nothing more.

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	let funcStart = 'let actionName = o.actName,' +	// The name of the action command that called this function.
		'actionPosition = o.actPos,' +				// The position in the action value, 0, 1, etc. - you can call more than one function if you comma-delimit them.
		'actionValue = o.actVal,' +					// The full evaluated action value.
		'actionValueUnEval = o.actValSing,' +		// The singular un-evaluated action value that called the function.
		'actionValuesUnEval = o.origActVal,' +		// The full comma delimited un-evaluated action value of the func action command.
		'actionFunc = o.func,' +					// The name of the function that was called.
		'eventSelector = o.obj,' +					// The event selector element itself, that received the event.
		'eventSelectorName = o.primSel,' +			// The name of the event selector.
		'carriedEventObject = o.ajaxObj,' +			// If func is called from an afterAjax type of event, this contains the "o" object from the event that triggered the ajax call.
		'conditionals = o.passCond,' +				// A space delimited list of any conditionals that were passed.
		'targetSelector = o.secSelObj,' +			// The target selector element itself.
		'targetSelectorName = o.origSecSel,' +		// The name of the target selector this function was called from. If it contains "&" it means the target selector was the event selector.
		'activeID = o.activeID,' +					// The internal reference to the target selector assigned. You shouldn't ever change this.
		'doc = o.doc,' +							// The document object where the target selector can be found.
		'e = o.e,' +								// The event object.
		'eventName = o.event,' +					// The name of the event.
		'configFile = o.file,' +					// The config file where the function call is written.
		'configLine = o.line,' +					// The line in the config file where you can find the function call.
		'rulesArray = o.rules,' +					// An array of all the action commands and un-evaluated values in the target selector declaration.
		'selectorRef = o.secSel,' +					// The target selector reference string.
		'compDoc = o.compDoc,' +				// The document of the shadow DOM, if applicable.
		'component = o.component,' +				// The name of the component, if applicable.
		'_loopRef = o.loopRef;';					// Internal reference for looping variable reference.

	// Now put in a routine to dynamically work out the variable scopes for the vars command. This is run dynamically, so we need to effective remove the vars command
	// and replace all the remaining content with correctly scoped variables. The original command must retain the vars command for dynamic use, hence this is
	// happening at the point of runtime. The _run function (found in the Run command file) sorts the variable scoping out.

	let newFunc = '_activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : "main";' +
		'scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];' +
		'_run(flyCommands[\'' + funcName + '\'], _activeVarScope, o);';

	flyCommands[funcName] = '{=' + funcStart + funcContent.substr(2);

	_a[funcName] = new Function('o', 'scopedProxy', 'privVarScopes', 'flyCommands', '_run', newFunc);		// jshint ignore:line
};

_a.CreateConditional = o => {
	// Create an Active CSS conditional dynamically.
	let funcName = o.actVal.split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.
	if (_c[funcName]) return;	// If this command already exists, do nothing more.

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	let funcStart = 'let conditionalName = o.actName,' +	// The name of the action command that called this function.
		'conditionalFunc = o.func,' +
		'conditionalValue = o.actVal,' +
		'eventSelectorName = o.primSel,' +
		'eventSelector = o.obj,' +
		'e = o.e,' +
		'doc = o.doc,' +
		'component = o.component,' + 
		'compDoc = o.compDoc,' + 
		'carriedEventObject = o.ajaxObj;';

	// Now put in a routine to dynamically work out the variable scopes for the vars command. This is run dynamically, so we need to effective remove the vars command
	// and replace all the remaining content with correctly scoped variables. The original command must retain the vars command for dynamic use, hence this is
	// happening at the point of runtime. The _run function (found in the Run command file) sorts the variable scoping out.

	let newFunc = '_activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : "main";' +
		'scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];' +
		'return _run(flyConds[\'' + funcName + '\'], _activeVarScope, o);';

	flyConds[funcName] = '{=' + funcStart + funcContent.substr(2);

	_c[funcName] = new Function('o', 'scopedProxy', 'privVarScopes', 'flyConds', '_run', newFunc);		// jshint ignore:line
};

_a.CreateElement = o => {
	let aV = o.actVal, tag, upperTag, attrArr, attr, attrs = '', customTagClass, createTagJS, component, splitAV;
	splitAV = aV.split(' ');
	tag = splitAV[0];
	upperTag = tag.toUpperCase();

	let addedThisBefore = false;
	if (customTags.includes(upperTag)) {
		addedThisBefore = true;
	}

	// This is always need here. This should work on pre-rendered elements as long as the create-element is in preInit.
	// We need to remember this, and use it in _handleevents, as we won't run a component delineated event, we will run this main event draw event. Still without
	// leaving the component scope though. We just want this check in one little place in handleEvents and it should all work.
	// We have the customTags already in an array. If the event is a draw event and the element tag is in the array, we run the main draw event.

	if (splitAV[1] && splitAV[1].indexOf('observe(') === -1) {
		component = splitAV[1];
		if (config[tag] === undefined) config[tag] = {};
		if (config[tag].draw === undefined) config[tag].draw = {};
		if (config[tag].draw[0] === undefined) config[tag].draw[0] = [];
		if (config[tag].draw[0][0] === undefined) config[tag].draw[0][0] = [];
		let secSel = [];
		secSel['&'] = [];
		// Note: Below, "_acss-host_" is used to specify that the component definitely has a host so it should be scoped when rendering.
		// Components by default do not necessarily need to be scoped for performance reasons, but in this case we need to easily cover different possibilities
		// related to needing a host element. This was brought about by the need to nail down the handling for reference to {@host:...} variables.
		secSel['&'][0] = { file: '', line: '', intID: intIDCounter++, name: 'render', value: '"{|_acss-host_' + component + '}" after stack' };

		// Don't add it if it's already there.
		if (!addedThisBefore || typeof config[tag].draw[0][0][0] === 'undefined' ||
				typeof config[tag].draw[0][0][0]['&'] === 'undefined' ||
				typeof config[tag].draw[0][0][0]['&'][0] === 'undefined' ||
				config[tag].draw[0][0][0]['&'][0].name != 'render' ||
				config[tag].draw[0][0][0]['&'][0].value != '"{|_acss-host_' + component + '}" after stack'
			) {
			// Put the draw event render command at the beginning of any draw event that might already be there for this element.
			config[tag].draw[0][0].unshift(secSel);
			_setupEvent('draw', tag);
		}
	}

	if (addedThisBefore) return;

	// Get attributes. Cater for the possibility of multiple spaces in attr() list in actVal.
	attrArr = _getParVal(aV, 'observe').split(' ');
	for (attr of attrArr) {
		if (!attr) continue;
		attrs += "'" + attr.trim() + "',";
	}
	customTags.push(upperTag);

	// Create the custom tag.
	customTagClass = tag._ACSSConvFunc();
	createTagJS =
		'ActiveCSS.customHTMLElements.' + customTagClass + ' = class ' + customTagClass + ' extends HTMLElement {';
	if (attrs) {
		createTagJS +=
			'static get observedAttributes() {' +
				'return [' + attrs.slice(0, -1) + '];' +	// trim off trailing comma from attrs.
			'}';
	}
	createTagJS +=
			'constructor() {' +
				'super();' +
			'}' +
			'connectedCallback() {' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'connectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });' +
			'}' +
			'disconnectedCallback() {' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'disconnectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope, runButElNotThere: true });' +	// true = run when not there.
			'}';
	if (attrs) {
		createTagJS +=
			'attributeChangedCallback(name, oldVal, newVal) {' +
				'if (!oldVal && oldVal !== \'\' || oldVal === newVal) return;' +	// skip if this is the first time in or there's an unchanging update.
				'this.setAttribute(name + \'-old\', oldVal); ' +
				'let ref = this._acssActiveID.replace(\'d-\', \'\') + \'HOST\' + name;' +
				'ActiveCSS._varUpdateDom([{currentPath: ref, previousValue: oldVal, newValue: newVal, type: \'update\'}]);' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'attrChange\' + name._ACSSConvFunc(), component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });' +
				// Handle shadow DOM observe event. Ie. Tell the inner DOM elements that something has changed outside. We only do this when there has
				// been a change with the host attributes so we keep the isolation aspect of each shadow DOM. This way, the inner component can set
				// an observe event on the host, which is outside of the actual shadow DOM.
				'if (this.shadowRoot) _handleObserveEvents(null, this.shadowRoot);' +
			'}';
	}
	createTagJS +=
		'};' +
		'customElements.define(\'' + tag + '\', ActiveCSS.customHTMLElements.' + customTagClass + ');';
	Function('_handleEvents, _componentDetails, _handleObserveEvents', '"use strict";' + createTagJS)(_handleEvents, _componentDetails, _handleObserveEvents);	// jshint ignore:line
};

_a.DocumentTitle = o => {
	_setDocTitle(o.actVal._ACSSRepQuo());
};

_a.Eval = o => {
	// Run JavaScript dynamically in the global window scope. This is straight-up JavaScript that runs globally.
	let evalContent = o.actVal.slice(2, -2);
	eval(evalContent);		// jshint ignore:line
};

_a.Exit = o => {
	// Exit out of all current loops and prevent further target running and bubbling.
	_immediateStop(o);
};

_a.ExitTarget = o => _exitTarget(o);

const _exitTarget = o => {
	exitTarget['i' + o._imStCo] = true;
};

_a.FadeIn = o => _fade(o);

_a.FadeOut = o => _fade(o);

_a.FadeTo = o => _fade(o);

_a.FocusOff = o => {
	if (!_isConnected(o.secSelObj)) return false;
	_a.Blur(o);
};

_a.FocusOn = o => { _focusOn(o); };

const _focusOn = (o, wot, justObj=false) => {
	let el, nodes, arr, useI, doClick = false, moveNum = 1, n, targEl, endOfField = false;
	// For previousCycle and nextCycle, as well as a selector, it also takes in the following parameters:
	// 2, 3 - this says how far to go forward or back.
	// click - clicks on the item
	let val = o.actVal;
	if (val.indexOf(' end-of-field') !== -1) {
		endOfField = true;
		val = val.replace(/ end-of-field/, '');
	}
	let startingFrom = _getParVal(val, 'starting-from');	// Need to write a better function for getting values like this at some point, should return the remaining actVal string with properties in object form.
	if (startingFrom !== '') val = val.substr(0, val.indexOf('starting-from')).trim();

	if (wot == 'pcc' || wot == 'ncc') {
		if (val.indexOf(' click') !== -1) {
			doClick = true;
			val = val.replace(/ click/, '');
		}
		val = val.replace(/ ([\d]+)( |$)?/gm, function(_, innards) {
			moveNum = innards;
			return '';
		});
		val = val.trim();
	}

	let map = [ 'l', 'n', 'p', 'nc', 'pc', 'ncc', 'pcc' ];
	if (map.indexOf(wot) !== -1) {
		if (wot != 'l') {
			arr = _getFocusedOfNodes(val, o, startingFrom);	// compares the focused element to the list and gives the position and returns the nodes. Could optimize this for when moveNum > 0.
			nodes = arr[0];
			useI = arr[1];
			if (wot == 'pcc' || wot == 'ncc') {
				if (moveNum > nodes.length) {
					moveNum = moveNum % nodes.length;	// Correct moveNum to be less than the actual length of the node list (it gets the remainder).
				}
			}
		} else {
			// This will only ever run once, as moveNum will always be one.
			nodes = _getSels(o, val);
			if (!nodes) return false;	// invalid target.
		}
	}
	switch (wot) {
		case 'p':
		case 'pc':
		case 'pcc':
			if (wot == 'p') {
				if (useI === 0) return;
			} else {
				if (moveNum > useI) {
					// This move will take us back before 0.
					useI = nodes.length - moveNum - useI + 1;
				} else {
					useI = useI - moveNum + 1;
				}
			}
			el = nodes[useI - 1];
			break;
		case 'n':
		case 'nc':
		case 'ncc':
			if (wot == 'n') {
				if (useI == nodes.length - 1) return;
			} else {
				if (nodes.length <= moveNum + useI) {
					// This move will take us forward beyond the end.
					useI = moveNum + useI - nodes.length - 1;
				} else {
					useI = useI + moveNum - 1;
				}
			}
			el = nodes[useI + 1];
			break;
		case 'l':
			el = nodes[nodes.length - 1];
			break;
		default:
			el = _getSel(o, val);
	}
	if (!el) return;
	targEl = (el.tagName == 'FORM') ? el.elements[0] : el;
	if (doClick && (wot == 'pcc' || wot == 'ncc')) {
		ActiveCSS.trigger(targEl, 'click');
		setTimeout(function () {	// Needed for everything not to get highlighted when used in combination with select text area.
			if (endOfField && _isTextField(el)) {
				// Position cursor at end of line.
				_placeCaretAtEnd(el);
			} else {
				targEl.focus();
			}
		}, 0);
	} else if (!justObj) {
		if (o.func.substr(0, 5) == 'Click') {
			ActiveCSS.trigger(targEl, 'click');
		} else {
			if (endOfField && _isTextField(el)) {
				// Position cursor at end of line.
				_placeCaretAtEnd(el);
			} else {
				el.focus();
			}
		}
	}
	return targEl;
};

_a.FocusOnFirst = o => { _focusOn(o); };				//	First selector in list

_a.FocusOnLast = o => { _focusOn(o, 'l'); };			//	Last selector in list

_a.FocusOnNext = o => { _focusOn(o, 'n'); };			//	Next selector in list, or nothing

_a.FocusOnNextCycle = o => { _focusOn(o, 'nc'); };		//	Next selector in list, then cycles

_a.FocusOnPrevious = o => { _focusOn(o, 'p'); };		//	Previous selector in list

_a.FocusOnPreviousCycle = o => { _focusOn(o, 'pc'); };	//	Previous selector in list, then cycles

_a.FormReset = o => {
	let el = _getSel(o, o.actVal);
	if (el && el.tagName == 'FORM') el.reset();
};

_a.FullscreenExit = o => {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
};

_a.FullscreenOn = o => {
	let el = o.secSelObj;
	if (el.requestFullscreen) {
		el.requestFullscreen();
	} else if (el.mozRequestFullScreen) { /* Firefox */
		el.mozRequestFullScreen();
	} else if (el.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		el.webkitRequestFullscreen();
	} else if (el.msRequestFullscreen) { /* IE/Edge */
		el.msRequestFullscreen();
	}
};

_a.Func = o => {
	let pars = [];

	// Convert all spaces within double quotes to something else before the split.
	o.actVal = o.actVal._ACSSSpaceQuoIn();

	let spl = o.actVal.split(' ');
	let func = spl.splice(0, 1);
	if (typeof window[func] !== 'function') {
		_err(func + ' is not a function.', o);
	} else {
		// Iterate parameters loop. Convert true and false values to actual booleans. Put into the pars array and send to function.
		let par;
		for (par of spl) {
			if (par == 'true') {
				par = true;
			} else if (par == 'false') {
				par = false;
			} else if (!isNaN(par)) {	// Is this not a non-valid number. Or is this a valid number. Same thing.
				// Convert to a real number.
				par = parseFloat(par);
			} else {
				// Unconvert all spaces within double quotes back to what they were. Remove any surrounding double quotes, as it will go as a string anyway.
				par = par._ACSSSpaceQuoOut()._ACSSRepQuo();
				let checkIfVar = _getScopedVar(par, o.varScope);
				if (checkIfVar.val !== undefined) {
					par = checkIfVar.val;
				}
			}
			pars.push(par);
		}
		window[func](o, pars);
	}
};

_a.IframeReload = o => {
	// A cross-domain solution is to clone the iframe, insert before the original iframe and then remove the original iframe.
	let el = o.secSelObj.cloneNode(false);
	o.secSelObj.parentNode.insertBefore(el, o.secSelObj);
	ActiveCSS._removeObj(o.secSelObj);
};

_a.LoadAsAjax = o => {
	let el = document.querySelector(o.actVal);
	if (!el.isConnected) return;
	if (!el) {
		let pageContents = '<p>Active CSS Error: could not find template (' + o.actVal + ').</p>';
	} else {
		if (typeof o.secSelObj == 'object') {
			// This is an object that was passed.
			o.res = el.innerHTML;
			if (o.res != '') {
				o.res = _escapeInline(o.res, 'script');
				o.res = _escapeInline(o.res, 'style type="text/acss"');
			}
			_setHTMLVars({res: o.res});
			_handleEvents({ obj: o.obj, evType: 'afterLoadAsAjax', eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		}
	}

};

_a.LoadConfig = o => {
	// Dynamically load additional config if it has not already been loaded and append to existing unprocessed concatenated config.
	o.actVal = o.actVal._ACSSRepQuo();
	_addActValRaw(o);
	if (!configArr.includes(o.avRaw)) {
		o.file = o.actVal;	// We want the original to show in the extensions.
		_getFile(o.actVal, 'txt', o);
	} else {
		// Run the success script - we should still do this, we just didn't need to load the config.
		_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
	}
};

_a.LoadImages = o => {
	// eg. load-images: data-cjs-images
	// Looks for all attributes in o.actVal and puts that contents into the src, then removes the attribute.
	let attr = o.actVal;
	o.doc.querySelectorAll('img[' + attr + '], picture source[' + attr + ']').forEach(function (obj, index) {
		let attrName = (obj.tagName == 'IMG') ? 'src' : 'srcset';
		obj.setAttribute(attrName, obj.getAttribute(attr));
		obj.removeAttribute(attr);	// So it doesn't try to load it twice.
	});
};

_a.LoadScript = (o, opt) => {
	let scr = o.actVal._ACSSRepQuo();
	// If this is a stylesheet and it's been placed into a shadow DOM then make it unique so it can be loaded in multiple shadow DOMs.
	let forShadow = (supportsShadow && o.compDoc instanceof ShadowRoot);
	let storeRef = (opt == 'style' && forShadow) ? o.varScope + '|' : '';
	let trimmedURL = storeRef + _getBaseURL(scr);
	if (!scriptTrack.includes(trimmedURL)) {
		let typ = (opt == 'style') ? 'link' : 'script';
		let srcTag = (opt == 'style') ? 'href' : 'src';
		let scrip = document.createElement(typ);
		if (opt == 'style') {
			scrip.rel = 'stylesheet';
		}
		scrip[srcTag] = scr;
		let afterEvent = 'afterLoad' + ((opt == 'style') ? 'Style' : 'Script');
		scrip.onload = function() {
			// Run the after event for this command if successful.
			_handleEvents({ obj: o.obj, evType: afterEvent, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
		};
		scrip.onerror = function() {
			// Wipe any existing action commands after await, if await was used.
			_syncEmpty(o._subEvCo);
			// Call the general error callback event for this command.
			_handleEvents({ obj: o.obj, evType: afterEvent + 'Error', eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		};
		if (forShadow) {
			o.compDoc.appendChild(scrip);
		} else {
			document.head.appendChild(scrip);
		}
		scriptTrack.push(trimmedURL);
	}
};

_a.LoadStyle = o => { _a.LoadScript(o, 'style'); };

_a.Location = o => {
	let page = o.actVal._ACSSRepQuo();
	if (o.doc.contentWindow) {
		o.doc.contentWindow.document.location.href = page;
	} else {
		document.location.href = page;
	}
};

_a.MediaControl = o => {
	// Works with audio or video.
	if (!_isConnected(o.secSelObj)) return false;
	let secSelObj = o.secSelObj;	// This minifies better.
	let arr = o.actVal.split(' ');
	if (arr[1]) {
		arr[1] = arr[1]._ACSSRepQuo();
		switch (arr[0]) {
			case 'load':
				secSelObj.setAttribute('src', arr[1]);
				break;

			case 'seek':
				secSelObj.currentTime = parseFloat(arr[1]);
				break;

			case 'volume':
				secSelObj.volume = parseFloat(arr[1]);	// Value between 0 and 1.
				break;

		}
	}
	switch (arr[0]) {
		case 'play':
			secSelObj.play();
			break;

		case 'pause':
			secSelObj.pause();
			break;

		case 'load':
			secSelObj.load();
			break;
	}
};

_a.MimicInto = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let el, mType, val, valRef, targEl;
	el = o.secSelObj;
	// Get some properties of the target.
	if (o.actVal == 'title') {
		targEl = 'title';
		mType = 'title';
		val = currDocTitle;
	} else {
		targEl = _getSel(o, o.actVal);
		if (!targEl) return;
		if (targEl.tagName == 'INPUT' || targEl.tagName == 'TEXTAREA') {
			mType = 'input';
		} else {
			mType = 'text';
		}
	}

	// Get the value reference of the mimicked obj.
	valRef = _getFieldValType(el);
	if (o.actVal != 'title') {
		val = el[valRef];
	}

	// Now mimic has started we need to set up a reset event which will automatically put the contents back into the
	// target areas if the form containing the fields gets reset. This should be automatic behaviour.
	// Get the form property, add the reset value and reference to an array property in the form.
	// When the form is reset, check for this property. If it exists, run a routine to display these original values.
	// Note: this is different to using clone and restore-clone on the target of the mimic.
	var counter = 0;
	var pref = '';
	var closestForm = o.secSelObj.form || o.secSelObj.closest('form');
	if (closestForm) {
		if (!closestForm.cjsReset) {
			closestForm.cjsReset = [];
			// Log a reset event for this form.
			closestForm.addEventListener('reset', _mimicReset);
		}
		// Check if the reset value is already in there. We don't want to overwrite it with the previous change if it is.
		if (mType == 'title') {
			if (!closestForm.cjsReset.title) {
				closestForm.cjsReset.title = el.getAttribute('value');	// Get the original value before change.
			}
		} else {
			if (!el.activeResetValueSet) {
				// Add the default of the input field before it is changed for resetting later on if needed.
				counter = closestForm.cjsReset.length;
				closestForm.cjsReset[counter] = {};
				closestForm.cjsReset[counter].el = targEl;
				closestForm.cjsReset[counter].value = val;
				closestForm.cjsReset[counter].type = mType;
				el.activeResetValueSet = true;
			}
		}
	}

	// Mimic the value.
	var insVal;
	insVal = o.secSelObj[valRef];
	switch (mType) {
		case 'input':
			targEl.value = insVal;
			break;
		case 'text':
			targEl.innerText = insVal;
			break;
		case 'title':
			_setDocTitle(insVal);
	}
};

// _a.Pause = o => {};	// timings are handled in the core itself. This is here for documentation purposes only.

_a.PreventDefault = o => {
	if (o.e && o.e.preventDefault) o.e.preventDefault();	// Sometimes will get activated on a browser back-arrow, etc., so check first.
};

_a.Print = o => {
	if (o.actVal == 'window') {
		window.print();
	} else if (o.actVal == 'parent') {
		parent.print();
	} else {
		let iframeSel = _getSel(o, o.actVal);
		// Check that it's an iframe.
		if (iframeSel) {
			if (iframeSel.tagName == 'IFRAME') {
				iframeSel.contentWindow.print();
			} else {
				_err('Printing cannot occur because element is not an iframe: ' + o.actVal);
			}
		} else {
			_err('Printing cannot occur if iframe does not exist: ' + o.actVal);
		}
	}
};

_a.Remove = o => {
	let objs = _getSels(o, o.actVal);
	if (!objs) return false;	// invalid target.
	objs.forEach(function (obj) {
		ActiveCSS._removeObj(obj);
	});
};

_a.RemoveAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.secSelObj.removeAttribute(o.actVal);
};

_a.RemoveClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	ActiveCSS._removeClassObj(o.secSelObj, o.actVal);
	return true;	// true used with take-class.
};

_a.RemoveClone = o => {
	let el = _getSel(o, o.actVal);
	let ref = _getActiveID(el);
	if (ref) mimicClones[ref] = null; 
};

_a.RemoveCookie = o => {
	// Only cookie name, path & domain for this command. Command syntax structured in the same way as set-cookie for consistency.

	// Eg. remove-cookie: name("cookieName") path("/") domain("sdfkjh.com");

	// Double-quotes are optional for the syntax.
	let aV = o.actVal._ACSSRepAllQuo(), cookieName, cookieDomain, cookiePath, str;

	// Cookie name.
	cookieName = encodeURIComponent(_getParVal(aV, 'name'));

	// Domain.
	cookieDomain = _getParVal(aV, 'domain');

	// Path
	cookiePath = _getParVal(aV, 'path');

	str = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
	str += cookieDomain ? ` domain=${cookieDomain};` : '';
	str += cookiePath ? ` path=${cookiePath};` : '';

	document.cookie = str;
};

_a.RemoveHash = o => {
	o._removeHash = true;
	_a.UrlChange(o);
};

_a.RemoveProperty = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.secSelObj.style.removeProperty(o.actVal);
};

// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	if (!_isConnected(o.secSelObj)) return false;
	// Handle quotes.
	let content = _handleQuoAjax(o, o.actVal);	// Rejoin the string.

	// Make a copy of the target selector.
	// The child nodes of the target element can be referenced and output in inner components by referencing {$CHILDREN}.
	// The actual node itself can be referenced and output in inner components by referencing {$SELF}.
	let selfTree = '', childTree = '';
	if (o.secSelObj.nodeType === Node.ELEMENT_NODE) {
		let copyOfSecSelObj = o.secSelObj.cloneNode(true);
		if (content.indexOf('{$SELF}') !== -1) {
			selfTree = copyOfSecSelObj.outerHTML;
			o.renderPos = 'replace';
		}
		// If this is a custom component, get the child elements for use later on.
		let upperTag = o.secSelObj.tagName.toUpperCase();
		if (customTags.includes(upperTag)) {
			childTree = copyOfSecSelObj.innerHTML;
		}
	}

	// Handle any ajax strings.
	let strObj = _handleVars([ 'strings' ],
		{
			str: content,
			o: o.ajaxObj
		}
	);
	content = _resolveVars(strObj.str, strObj.ref);

	// Handle any components. This is only in string form at the moment and replaces the component with a placeholder - not the full html.
	// It doesn't need progressive variable substitution protection - it contains this in the function itself.
	content = _replaceComponents(o, content);

	_renderIt(o, content, childTree, selfTree);
};

_a.RenderAfterBegin = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'afterbegin'; _a.Render(o);
};

_a.RenderAfterEnd = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'afterend'; _a.Render(o);
};
_a.RenderBeforeBegin = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'beforebegin'; _a.Render(o);
};

_a.RenderBeforeEnd = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'beforeend'; _a.Render(o);
};

_a.RenderReplace = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'replace'; _a.Render(o);
};

_a.RestoreClone = o => {
	if (!_isConnected(o.secSelObj)) return false;
	// This has a settimeout so it puts it at the end of the queue so other things can be destroyed if they are going on.
	let el = _getSel(o, o.actVal);
	let ref = _getActiveID(el);
	if (!mimicClones[ref]) return;	// Clone not there.
	if (el.tagName == 'IFRAME') {
		if (el.contentWindow.document.readyState != 'complete') {
			return false;	// Don't bother restoring, iframe is changing. Barf out.
		}
		setTimeout(function() {
			el.contentWindow.document.body = mimicClones[ref];
		}, 0);
	} else {
		setTimeout(function() {
			let parEl = el.parentNode;
			parEl.replaceChild(mimicClones[ref], el);
			// Need to retrigger the draw events.
			_a.Trigger({ secSel: '', actVal: 'draw', secSelObj: parEl, ajaxObj: o.ajaxObj, e: o.el || null });
		}, 0);
	}
};

_a.Run = o => {
	_run(o.actVal, o.varScope, o);
};

_a.ScrollIntoView = o => {
	if (!_isConnected(o.secSelObj)) return false;
	/* Parameters
	true = block-start block-nearest
	false = block-end block-nearest

	behaviour-auto = { behaviour: 'auto' }
	behaviour-smooth = { behaviour: 'smooth' }
	block-start = { block: 'start' }
	block-center = { block: 'center' }
	block-end = { block: 'end' }
	block-nearest = { block: 'nearest' }
	inline-start = { inline: 'start' }
	inline-center = { inline: 'center' }
	inline-end = { inline: 'end' }
	inline-nearest = { inline: 'nearest' }
	*/
	let arr = o.actVal.split(' ');
	let bl = 'start', inl = 'nearest';
	let behave = _optDef(arr, 'behaviour-smooth', 'smooth', 'auto');
	if (o.actVal == 'true') {
		// Options are already set.
	} else if (o.actVal == 'false') {
		bl = 'end';
	}
	bl = _optDef(arr, 'block-center', 'center', bl);	// center not supported in Firefox 48.
	bl = _optDef(arr, 'block-end', 'end', bl);
	bl = _optDef(arr, 'block-nearest', 'nearest', bl);
	inl = _optDef(arr, 'inline-center', 'center', inl);
	inl = _optDef(arr, 'inline-end', 'end', inl);
	inl = _optDef(arr, 'inline-nearest', 'nearest', inl);

	try {	// Causes error in Firefox 48 which doesn't support block center, so fallback to default for block on failure.
		o.secSelObj.scrollIntoView({ behaviour: behave, block: bl, inline: inl });
	} catch (err) {
		o.secSelObj.scrollIntoView({ behaviour: behave, inline: inl });
	}
};

_a.ScrollX = o => {
	if (!_isConnected(o.secSelObj)) return false;
	if (o.origSecSel == 'body') {
		// All of these have been tested.
		if (o.actVal == 'left') {
			window.scrollTo({ left: 0 });
		} else if (o.actVal == 'right') {
			window.scrollTo({ left: 10000000 });	// As long as it's greater than the scroll bar it will go to the right, as standard.
		} else {
			window.scrollTo({ left: o.actVal });
		}
	} else {
		let el = o.secSelObj;
		if (o.actVal == 'left') {
			el.scrollLeft = 0;
		} else if (o.actVal == 'right') {
			el.scrollLeft = 10000000;	// As long as it's greater than the scroll bar it will go to the right, as standard. 10 million pixels should do it.
		} else {
			el.scrollLeft = o.actVal;
		}
	}
};

_a.ScrollY = o => {
	if (!_isConnected(o.secSelObj)) return false;
	if (o.origSecSel == 'body') {
		// All of these have been tested.
		if (o.actVal == 'top') {
			window.scrollTo({ top: 0 });
		} else if (o.actVal == 'bottom') {
			window.scrollTo({ top: 10000000 });		// As long as it's greater than the scroll bar it will go to the bottom, as standard.
		} else {
			window.scrollTo({ top: o.actVal });
		}
	} else {
		let el = o.secSelObj;
		if (el) {
			if (o.actVal == 'top') {
				el.scrollTop = 0;
			} else if (o.actVal == 'bottom') {
				el.scrollTop = el.scrollHeight;
			} else {
				el.scrollTop = o.actVal;
			}
		}
	}
};

_a.SelectAll = o => {
	requestAnimationFrame(() => document.execCommand('selectAll'));
};

_a.SelectNone = o => {
	getSelection().removeAllRanges();
};

_a.SetAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let htmlEntityDecode = false;
	let str = o.actVal;
	if (str.endsWith(' html-entity-decode')) {
		htmlEntityDecode = true;
		str = str.substr(0, str.length - 19).trim();
	}
	str = str._ACSSSpaceQuoIn();
	let attrArr = str.split(' ');
	let strToInsert = _handleQuoAjax(o, attrArr[1])._ACSSSpaceQuoOut();
	strToInsert = (htmlEntityDecode) ? _unHtmlEntities(strToInsert) : strToInsert;
	if (o.func == 'SetProperty') {
		o.secSelObj[attrArr[0]] = (strToInsert == 'true') ? true : (strToInsert == 'false') ? false : strToInsert;
	} else {
		o.secSelObj.setAttribute(attrArr[0], strToInsert);
	}
};

_a.SetClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = o.actVal.replace(/\./g, '')._ACSSRepQuo();
	_setClassObj(o.secSelObj, str);
};

/**
 * Action command to set a cookie
 *
 * Called by:
 *	_handleFunc()
 *
 * Side-effects:
 *	Sets the string value into a cookie
 *
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 *
 * Notes from MDN (this can change when the browser evolves):
 *	Set-Cookie: <cookie-name>=<cookie-value> 
 *	Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
 *	Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
 *	Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
 *	Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
 *	Set-Cookie: <cookie-name>=<cookie-value>; Secure
 *	Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
 *	Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
 *	Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
 *	Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None
 */
_a.SetCookie = o => {
	// Example syntax (double-quotes are optional everywhere for this command):
	// set-cookie: name("name") value("value") expires("date") maxAge("non-zero-digit") domain("domain") path("path") secure httponly sameSite("strict/lax/none");

	let aV = o.actVal, cookieName, cookieValue, expires, maxAge, cookieDomain, cookiePath, httpOnly, secure, secureIfHttps, sameSite;

	//	Replace escaped quotes.
	aV = aV.replace(/\\\"/g, '_ACSS_escaped_quote');
	//	Fill in the spaces between quotes with an alternate space string, and remove the quotes.
	aV = aV._ACSSSpaceQuoIn();
	//	Put the escaped quotes back. This gives us a true space delimited string of options that can be split later on.
	aV = aV.replace(/_ACSS_escaped_quote/g, '\\\"');

	// Cookie name.
	cookieName = encodeURIComponent(_getParVal(aV, 'name')._ACSSRepQuo());

	// Cookie value.
	cookieValue = encodeURIComponent(_getParVal(aV, 'value')._ACSSSpaceQuoOut()._ACSSRepQuo());

	// Expires.
	expires = _getParVal(aV, 'expires')._ACSSSpaceQuoOut()._ACSSRepQuo();
	if (expires == 'Infinity') {
		expires = 'Fri, 31 Dec 9999 23:59:59 GMT';	// After 8000 years that user will be forced to refresh his browser.
	} else {
		let attemptToGetDate = _getPastFutureDate(expires);
		// JavaScript has no date validity function, and alternatives will bloat the core.
		// If it's not in the right format by the developer, we must assume that it's a specific thing that the developers wants to be set.
		expires = (attemptToGetDate instanceof Date) ? attemptToGetDate.toUTCString() : expires;
	}

	// Max-Age.
	maxAge = _getParVal(aV, 'maxAge')._ACSSRepQuo();
	if (maxAge) {
		if (!DIGITREGEX.test(maxAge)) _warn('set-cookie maxAge is not a number', o);
	}

	// Domain.
	cookieDomain = _getParVal(aV, 'domain')._ACSSRepQuo();

	// Path
	cookiePath = _getParVal(aV, 'path')._ACSSRepQuo();

	// SameSite
	sameSite = _getParVal(aV, 'sameSite')._ACSSCapitalize()._ACSSRepQuo();

	// Split the array by space.
	let arr = aV.split(' ');

	// HttpOnly.
	httpOnly = _optDef(arr, 'httponly', true, false);

	// Secure/secureIfHttps
	secureIfHttps = _optDef(arr, 'secureIfHttps', true, false);
	if (secureIfHttps) {
		secure = (window.location.protocol == 'https:');
	} else {
		secure = _optDef(arr, 'secure', true, false);
	}

	let str = `${cookieName}=${cookieValue};`;
	str += expires ? ` Expires=${expires};` : '';
	str += maxAge ? ` Max-Age=${maxAge};` : '';
	str += cookieDomain ? ` Domain=${cookieDomain};` : '';
	str += cookiePath ? ` Path=${cookiePath};` : '';
	str += secure ? ' Secure;' : '';
	str += sameSite ? ` SameSite=${sameSite};` : '';
	str += httpOnly ? ' HttpOnly;' : '';

	str = str._ACSSSpaceQuoOut();

	document.cookie = str;
};

_a.SetProperty = o => {
	if (!_isConnected(o.secSelObj)) return false;
	_a.SetAttribute(o);
	_handleObserveEvents(null, o.doc);
};

_a.StopEventPropagation = o => _stopEventPropagation(o);

const _stopEventPropagation = o => {
	// Don't bubble up the Active CSS component element hierarchy.
	// Short variable names are used here as there are a lot of passing around of variables and it help keeps the core small.
	// maEv = main event object, o._maEvCo = main event object counter
	// taEv = target event object, o._taEvCo = target event object counter
	if (typeof maEv[o._maEvCo] !== 'undefined') maEv[o._maEvCo]._acssStopEventProp = true;
};

_a.StopImmediateEventPropagation = o => _stopImmediateEventPropagation(o);

const _stopImmediateEventPropagation = o => {
	// Don't bubble up the Active CSS element hierarchy and do any more target selectors.
	// Short variable names are used here as there are a lot of passing around of variables and it help keeps the core small.
	// maEv = main event object, o._maEvCo = main event object counter
	// taEv = target event object, o._taEvCo = target event object counter
	if (typeof taEv[o._taEvCo] !== 'undefined') taEv[o._taEvCo]._acssStopImmedEvProp = true;
	_stopEventPropagation(o);
};

_a.StopImmediatePropagation = o => {
	// Don't bubble up the Active CSS element hierarchy and do any more target selectors and stop propagation in the browser too.
	if (o.e && o.e.stopImmediatePropagation) o.e.stopImmediatePropagation();
	_a.StopImmediateEventPropagation(o);
};

_a.StopPropagation = o => {
	// Don't bubble up the Active CSS element hierarchy and stop propagation in the browser too.
	if (o.e && o.e.stopPropagation) o.e.stopPropagation();
	_a.StopEventPropagation(o);
};

_a.Style = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = _handleQuoAjax(o, o.actVal);
	let wot = str.split(' '), prop = wot.shift();
	o.secSelObj.style[prop] = wot.join(' ');
};

_a.TakeClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	// Take class away from any element that has it, with an optional scope parameter.
	let aVRes = _extractActionPars(o.actVal, [ 'scope' ], o);
	let theClass = aVRes.action.substr(1);

	_eachRemoveClass(theClass, theClass, o.doc, aVRes.scope);
	_a.AddClass({ secSelObj: o.secSelObj, actVal: theClass });
};

_a.ToggleClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = o.actVal.replace(/\./g, '');
	_toggleClassObj(o.secSelObj, str);
};

_a.Trigger = o => {
	let oClone = _clone(o);

	if (typeof o.secSel == 'string' && o.secSel.indexOf('~') !== -1) {
		// Remove any attached scopes prior to handling the event - probably custom event came from a sub-component. The event handling adds the scopes on as indicated.
		let colonPos = o.secSel.indexOf(':');
		let unScopedSecSel = (colonPos !== -1) ? o.secSel.substr(colonPos + 1) : o.secSel;
		// This is a trigger on a custom selector. Pass the available objects in case they are needed.
		_handleEvents({ obj: unScopedSecSel, evType: oClone.actVal, primSel: oClone.primSel, origO: oClone, otherObj: oClone.ajaxObj, eve: o.e, origObj: oClone.obj, varScope: oClone.varScope, evScope: oClone.evScope, compDoc: oClone.compDoc, component: oClone.component, _maEvCo: oClone._maEvCo });
	} else {
		// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
		// Is this a draw event? If so, we also want to run all draw events for elements within.
		if (o.actVal == 'draw') {
			_runInnerEvent(o, o.secSelObj, 'draw');
		} else if (o.origSecSel == 'body' || o.origSecSel == 'window') {
			// Run any events on the body, followed by the window.
			_handleEvents({ obj: 'body', evType: oClone.actVal, origO: oClone, compDoc: document });
			let windowClone = _clone(o);
			_handleEvents({ obj: 'window', evType: windowClone.actVal, origO: windowClone, eve: o.e, compDoc: document });
		} else {
			_handleEvents({ obj: oClone.secSelObj, evType: oClone.actVal, primSel: oClone.primSel, origO: oClone, otherObj: oClone.ajaxObj, eve: o.e, varScope: oClone.varScope, evScope: oClone.evScope, compDoc: oClone.compDoc, component: oClone.component, _maEvCo: oClone._maEvCo });
		}
	}
};

_a.TriggerReal = o => {
	// Simulate a real event, not just a programmatical one.
	if (!_isConnected(o.secSelObj)) {
		// Skip it if it's no longer there and cancel all Active CSS bubbling.
		_a.StopPropagation(o);
		return false;
	}
	try {
		o.secSelObj.addEventListener(o.actVal, function(e) {}, {capture: true, once: true});	// once = automatically removed after running.
		o.secSelObj[o.actVal]();
	} catch(err) {
		_err('Only DOM events support trigger-real', o);
	}
};

_a.UrlChange = o => {
	// Check that url-change hasn't been just run, as if so we don't want to run it twice.
	// Check if there is a page-title in the rules. If so, this needs to be set at the same time, so we know what
	// url to go back to.
	let val = o.actVal, alsoRemove;
	if (val.indexOf('remove-last-hash') !== -1) {
		val = val.replace(/remove\-last\-hash/g, '').trim();
		o._removeLastHash = true;
	}
	let wot = val.split(' ');
	let url = wot[0];
	let titl = val.replace(url, '').trim();
	if (titl == '') {
		// default to current title if no parameter set.
		titl = document.title;
	}
	_urlTitle(url, titl, o, alsoRemove);
};

_a.UrlReplace = o => {
	o._urlReplace = true;
	_a.UrlChange(o);
};

_a.Var = o => {
	let locStorage, sessStorage, newActVal = o.actValSing;

	if (newActVal.endsWith(' session-storage')) {
		sessStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 16);
	} else if (newActVal.endsWith(' local-storage')) {
		locStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 14);
	}

	// Get the name of the variable on the left.
	let arr = newActVal._ACSSSpaceQuoIn().split(' ');
	let varName = arr.shift()._ACSSSpaceQuoOut();

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings' ],
		{
			str: varName,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);
	varName = _resolveVars(strObj.str, strObj.ref);

	// Get the expression on the right.
	let varDetails = arr.join(' ')._ACSSSpaceQuoOut();

	if (!varDetails) {
		// A right-hand expression is needed, unless it a ++ or a -- operator is being used.
		if (varName.endsWith('++')) {
			varName = varName.slice(0, -2);
			varDetails = '{' + varName + '}+1';
		} else if (varName.endsWith('--')) {
			varName = varName.slice(0, -2);
			varDetails = '{' + varName + '}-1';
		} else {
			// Assign to null if no assignment.
			varDetails = 'null';
		}
	}

	// Now check the varname before the "." or the "[" to see if it is the session or local storage reference arrays.
	let storeCheck = varName;
	let storeCheckDot = varName.indexOf('.');
	let storeCheckBrack = varName.indexOf('[');
	if (storeCheckDot !== -1) {
		storeCheck = varName.substr(0, storeCheckDot);
	} else if (storeCheckBrack !== -1) {
		storeCheck = varName.substr(0, storeCheckBrack);
	}

	// Add in correct scoped variable locations.
	if (sessStorage || sessionStoreVars[storeCheck] === true) {
		sessionStoreVars[storeCheck] = true;
		varName = 'scopedProxy.session.' + varName;
	} else if (locStorage || localStoreVars[storeCheck] === true) {
		localStoreVars[storeCheck] = true;
		varName = 'scopedProxy.local.' + varName;
	}

	varName = _resolveInnerBracketVars(varName, o.varScope);	// inner brackets are done in getScopedVar but it also needs to be done here before _prefixScopedVars.
	varName = _prefixScopedVars(varName, o.varScope);

	// Set up left-hand variable for use in _set() later on.
	let scopedVar, isWindowVar = false;
	if (varName.startsWith('window.')) {
		// Leave it as it is - it's a variable in the window scope.
		isWindowVar = true;
		scopedVar = varName.substr(7);
	} else if (varName.startsWith('scopedProxy.')) {
		scopedVar = varName;
		scopedVar = scopedVar.replace('scopedProxy.', '');	// We don't want the first part of the left-hand variable to contain "scopedProxy." any more.
	} else {
		let scoped = _getScopedVar(varName, o.varScope);
		scopedVar = scoped.name;
	}

	strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings', 'html' ],
		{
			str: varDetails,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);

	varDetails = _resolveVars(strObj.str, strObj.ref);

	varDetails = _resolveInnerBracketVars(varDetails, o.varScope);

	varDetails = _prefixScopedVars(varDetails, o.varScope);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed.
	varDetails = '{=' + varDetails + '=}';

	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	// Allow the o object to get evaluated in the expression if references are there.
	let expr = _replaceJSExpression(varDetails, true, false, o.varScope, -1, o);	// realVal=true, quoteIfString=false, varReplacementRef=-1

	// Escape result for curlies to stop possible re-evaluation on re-assignment.
	if (typeof expr === 'string') {
		expr = _escNoVars(expr);
	}

	// Set the variable in the correct scope.
	if (isWindowVar) {
		// Window scope.
//		console.log('_a.Var, set in window scope ' + scopedVar + ' = ', expr, 'o:', o);		// handy - don't remove
		_set(window, scopedVar, expr);
	} else {
		// Active CSS component/document scopes.
//		console.log('_a.Var, set ' + scopedVar + ' = ', expr, 'o:', o);		// handy - don't remove
		_set(scopedProxy, scopedVar, expr);
		_allowResolve(scopedVar);
	}
};

_a.VarDelete = o => {
	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings' ],
		{
			str: o.actValSing,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);
	let newActVal = _resolveVars(strObj.str, strObj.ref);

	let scoped = _getScopedVar(newActVal, o.varScope);
	let mainScope = (scoped.winVar) ? window : scopedProxy;
	_unset(mainScope, scoped.name);
};

ActiveCSS.first = sel => { return _focusOn({ actVal: sel }, null, true); };				//	First selector in list

ActiveCSS.last = sel => { return _focusOn({ actVal: sel }, 'l', true); };				//	Last selector in list

ActiveCSS.next = sel => { return _focusOn({ actVal: sel }, 'n', true); };				//	Next selector in list, or nothing

//	Next selector in list, then cycles
ActiveCSS.nextCycle = sel => {
	return _focusOn({ actVal: sel }, 'ncc', true);
};

ActiveCSS.previous = sel => { return _focusOn({ actVal: sel }, 'p', true); };			//	Previous selector in list

//	Previous selector in list, then cycles
ActiveCSS.previousCycle = sel => {
	return _focusOn({ actVal: sel }, 'pcc', true);
};

ActiveCSS.trigger = (sel, ev, varScope, compDoc, component, evScope, eve) => {
	/* API command */
	/* Possibilities:
	ActiveCSS.trigger('~restoreAfterTinyMCE', 'custom');		// Useful for calling random events.
	ActiveCSS.trigger(o.obj, 'customCancel');	// Useful for external function to call a custom event on the initiating object.

	// This needs to be expanded to include ajaxobj, e and obj, so an after trigger can continue. FIXME at some point.
	*/
	// Subject to conditionals.
	if (typeof sel == 'object') {
		// This is an object that was passed.
		_handleEvents({ obj: sel, evType: ev, varScope, evScope, compDoc, component, eve });
	} else {
		_a.Trigger({ secSel: sel, actVal: ev, varScope, evScope, compDoc, component, eve });
	}
};

ActiveCSS.triggerReal = (obj, ev, varScope, compDoc, component) => {
	if (typeof obj === 'string') {
		obj = document.querySelector(obj);
	}
	if (obj) {
		_a.TriggerReal({ secSelObj: obj, actVal: ev, varScope: varScope, compDoc: compDoc, component: component });
	} else {
		_err('No object found in document to triggerReal', o);
	}
};

_c.IfChecked = o => _selCompare(o, 'iC');

_c.IfCompletelyVisible = o => { return ActiveCSS._ifVisible(o, true); };	// Used by extensions.

_c.IfCookieEquals = o =>  {
	let spl = o.actVal.split(' ');
	if (!_cookieExists(spl[0])) return false;
	let nam = spl[0];
	spl.shift();
	spl = spl.join(' ');
	return (_getCookie(nam) == spl._ACSSRepQuo());
};

_c.IfCookieExists = o => {
	return _cookieExists(o.actVal);
};

_c.IfDefined = o => {
	let scoped = _getScopedVar(o.actVal, o.varScope);
	return (typeof scoped.val !== 'undefined');
};

_c.IfDisplay = o => {
	let el = _getSel(o, o.actVal);
	return (el && getComputedStyle(el, null).display !== 'none');
};

_c.IfEmpty = o => { return (_selCompare(o, 'eM')); };

_c.IfEmptyTrimmed = o => { return (_selCompare(o, 'eMT')); };

_c.IfExists = o => {
	return (_getSel(o, o.actVal)) ? true : false;
};

_c.IfFocusFirst = o => { return _ifFocus(o); };

_c.IfFocusLast = o => { return _ifFocus(o, false); };

_c.IfFormChanged = o => { return _checkForm(_getSel(o, o.actVal), 'check'); };

_c.IfFunc = o => {
	// Not a one-liner as we need the try/catch and error message.
	if (o.actVal == 'true') {
		return true;
	} else if (o.actVal == 'false') {
		return false;
	} else {
		try {
			return window[o.actVal](o);
		} catch(r) {
			_err('Function ' + o.actVal + ' does not exist', o);
		}
	}
};

_c.IfHasClass = o => {
	let arr = _actValSelItem(o);
	return (arr[0] && ActiveCSS._hasClassObj(arr[0], arr[1].substr(1)));		// "ActiveCSS." indicates that it is used by extensions.
};

_c.IfInnerHtml = o => _selCompare(o, 'iH');	// Used in core unit testing.

_c.IfInnerText = o => _selCompare(o, 'iT');

_c.IfMaxHeight = o => _selCompare(o, 'maH');

_c.IfMaxLength = o => _selCompare(o, 'maL');

_c.IfMaxWidth = o => _selCompare(o, 'maW');

_c.IfMediaMaxWidth = o => {
	return _checkMedia('all and (max-width: ' + o.actVal + ')');
};

_c.IfMediaMinWidth = o => {
	return _checkMedia('all and (min-width: ' + o.actVal + ')');
};

_c.IfMinHeight = o => _selCompare(o, 'miH');

_c.IfMinLength = o => _selCompare(o, 'miL');

_c.IfMinWidth = o => _selCompare(o, 'miW');

_c.IfScrolltopGreater = o => {
	if (o.obj == 'body') {
		return (window.pageYOffset || document.documentElement.scrollTop) > o.actVal;
	} else {
		return o.obj.scrollTop > o.actVal;
	}
};

_c.IfScrolltopLess = o => {
	if (o.obj == 'body') {
		return (window.pageYOffset || document.documentElement.scrollTop) < o.actVal;
	} else {
		return o.obj.scrollTop < o.actVal;
	}
};

_c.IfSelection = o => {
  let selObj = window.getSelection();
  o.actVal = o.actVal._ACSSRepQuo().trim();
  return (selObj.toString() == o.actVal);
};

_c.IfValue = o => _selCompare(o, 'iV');

_c.IfVar = o => {
	// This caters for scoped variable and also window variable comparison. If the variable isn't in the scope, it takes the window variable if it is there.
	// First parameter is the variable name.
	// Second parameter is a string, number or boolean. Any JavaScript expression ({= ... =} clauses) has already been evaluated.
	// This also takes only one parameter, in which case it is checked for evaluating to boolean true.

	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl = actVal.split(' ');
	let compareVal, varName;
	varName = spl.shift();	// Remove the first element from the array.

	compareVal = spl.join(' ')._ACSSSpaceQuoOut();
	compareVal = (compareVal == 'true') ? true : (compareVal == 'false') ? false : compareVal;
	let scoped = _getScopedVar(varName, o.varScope);
	let varValue = scoped.val;

	if (typeof compareVal !== 'boolean') {
		if (typeof compareVal == 'string' && compareVal.indexOf('"') === -1) {
			if (_isArray(varValue)) {
				if (compareVal == '') {
					// Nothing to compare, return whether this value to check is a populated array.
					return (varValue.length > 0) ? true : false;
				}
			} else {
				if (compareVal == '') {
					// Nothing to compare, return whether this value equates to true.
					return (varValue) ? true : false;
				}
				compareVal = Number(compareVal._ACSSRepQuo());
			}
		} else {
			if (_isArray(varValue)) {
				try {
					// Convert compare var to an array.
					compareVal = JSON.stringify(JSON.parse(compareVal));
					// Stringify allows us to compare two arrays later on.
					varValue = JSON.stringify(varValue);
				} catch(err) {
					// If there's an error, it's probably because the comparison didn't convert to an array, so it doesn't match.
					return false;
				}
			} else {
				compareVal = compareVal._ACSSRepQuo();
			}
		}
	}

	return (typeof varValue == typeof compareVal && varValue == compareVal);
};

_c.IfVarTrue = o => {
	o.actVal += ' true';
	return _c.IfVar(o);
};

_c.IfVisible = o => { return ActiveCSS._ifVisible(o); };	// Used by extensions.

/* Internal conditional command only */
_c.MqlTrue = o => {
	return mediaQueries[o.actVal].val;
};

const _addCancelAttr = (obj, func) => {
	let activeID = _getActiveID(obj);
	if (!cancelIDArr[activeID]) cancelIDArr[activeID] = [];
	cancelIDArr[activeID][func] = true;
};

const _clearTimeouts = delayID => {
	// Note: In Active CSS it is impossible to have an "after" delay and an "every" interval happening at the same
	// time. "After" delays always come before "every" intervals. When removing timeouts or intervals there should never be a clash in numbers as setInterval and
	// setTimeout should share the same pool of IDs in browsers, or at least they are supposed to :) Distinction clarity in the use case here is not helpful, as it
	// means adding unnecessary code. This is not good practice if it isn't needed. Unless things are likely to change in the future due to the same pool not being
	// part of the W3C spec, but it is *implied, just about* in the spec that they share the same pool, so it should be ok.
	clearTimeout(delayID);
	clearInterval(delayID);
	_syncEmpty(delaySync[delayID]);
	delete delaySync[delayID];
};

const _delaySplit = (str, typ, varScope) => {
	// Return an array containing an "after" or "every" timing, and any label (label not implemented yet).
	// Ignore entries in double quotes. Wipe out the after or every entries after handling.
	let regex, convTime, theLabel;
	regex = new RegExp('(' + typ + ' (0|stack|([\\{]?[\\@]?[\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w\\-\\.\\:\\[\\]]+[\\}]?)(s|ms)))(?=(?:[^"]|"[^"]*")*)', 'gm');
	str = str.replace(regex, function(_, wot, wot2, delayValue, delayType) {
		if (delayValue && delayValue.indexOf('{') !== -1) {
			// Remove any curlies. The variable if there will be evaluated as it is, in _replaceJSExpression. Only one variable is supported.
			delayValue = delayValue.replace(/[\{\}]+/g, '');
			// Replace any scoped variables that may be in the timer value from inside _replaceJSExpression.
			convTime = _replaceJSExpression('{=' + delayValue + '=}', true, false, varScope) + delayType;
		} else {
			convTime = wot2;
		}
		convTime = _convertToMS(convTime, 'Invalid delay number format: ' + wot);
		return '';
	});
	// "after" and "every" share the same label. I can't think of a scenario where they would need to have their own label, but this functionality may need to be
	// added to later on. Maybe not.
	str = str.replace(/(label [\u00BF-\u1FFF\u2C00-\uD7FF\w]+)(?=(?:[^"]|"[^"]*")*)$/gm, function(_, wot) {
		// Label should be wot.
		theLabel = wot.split(' ')[1];
		return (typ == 'every') ? '' : wot;
	});
	return { str: str.trim(), tim: convTime, lab: theLabel };
};

const _getDelayRef = o => {
	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = (o.evScope ? o.evScope : 'doc') + o.secSel;
	} else {
		delayRef = _getActiveID(o.secSelObj);
	}
	return delayRef;
};

const _removeCancel = (delayRef, func, actPos, intID, loopRef) => {
	if (delayArr[delayRef] && delayArr[delayRef][func] && delayArr[delayRef][func][actPos] && delayArr[delayRef][func][actPos][intID]) {
		let tid = delayArr[delayRef][func][actPos][intID][loopRef];
		if (tid && labelByIDs[tid]) {
			let delData = labelByIDs[tid];
			labelByIDs.splice(labelByIDs.indexOf[tid]);
			delete labelData[delData.lab];
		}
		delete delayArr[delayRef][func][actPos][intID][loopRef];
		delete delaySync[tid];
	}
	if (['~', '|'].includes(delayRef.substr(0, 1))) {
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][func] && cancelCustomArr[delayRef][func][actPos] && cancelCustomArr[delayRef][func][actPos][intID]) {
			delete cancelCustomArr[delayRef][func][actPos][intID][loopRef];
		}
	} else {
		if (cancelIDArr[delayRef] && cancelIDArr[delayRef][func]) {
			delete cancelIDArr[delayRef][func];
		}
	}
};

const _setupLabelData = (lab, del, func, pos, intID, loopRef, _subEvCo, tid) => {
	delayArr[del][func][pos][intID][loopRef] = tid;
	delaySync[tid] = _subEvCo;
	if (lab) {
		labelData[lab] = { del, func, pos, intID, loopRef, tid };
		// We don't want to be loop or sorting for performance reasons, so we'll just create a new array to keep track of the data we need for later.
		labelByIDs[tid] = { del, func, pos, intID, loopRef, lab };
	}
};

const _unloadAllCancelTimer = () => {
	let i;
	// Each timeout needs individually deleting, hence the nested loopage. There should never be lots delayed events at any one time, and they do get cleaned up.
	for (i in delayArr) {
		_unloadAllCancelTimerLoop(i);
	}
	delayArr = [];
	cancelIDArr = [];
	labelData = [];
	labelByIDs = [];
};

const _unloadAllCancelTimerLoop = i => {
	let j, k, l, m;
	for (j in delayArr[i]) {
		for (k in delayArr[i][j]) {
			for (l in delayArr[i][j][k]) {
				for (m in delayArr[i][j][k][l]) {
					_clearTimeouts(delayArr[i][j][k][l][m]);
				}
			}
		}
	}
};

const _run = (str, varScope, o) => {
	let inn;
	let funky = '"use strict";' + str.replace(/\{\=([\s\S]*?)\=\}/m, function(_, wot) {
		inn = _handleVarsInJS(wot, varScope);
		return inn;
	});

	try {
		return Function('scopedProxy, o, _safeTags, _unSafeTags, _escNoVars', funky)(scopedProxy, o, _safeTags, _unSafeTags, _escNoVars);		// jshint ignore:line
	} catch (err) {
		_err('Function syntax error (' + err + '): ' + funky, o);
	}
};

const _actionValLoop = (oCopy, pars, obj, runButElNotThere) => {
	_actionValLoopDo(oCopy, pars, obj, runButElNotThere, 0);
};

const _actionValLoopDo = (oCopy, pars, obj, runButElNotThere, counter) => {
	let oCopy2 = _clone(oCopy);

	oCopy2.actVal = pars.actVals[counter].trim();	// Put the original back.
	oCopy2.actPos = counter;	// i or label (not yet built).
	oCopy2.secSelObj = obj;
	oCopy2._tgEvCo = 'i' + targetCounter++;
	oCopy2._tgResPos = oCopy2._subEvCo + oCopy2._tgEvCo;
	oCopy2._funcObj = { oCopy, pars, obj, counter, runButElNotThere };
	_handleFunc(oCopy2, null, runButElNotThere);
};

const _addInlinePriorToRender = (str) => {
	// Unescape all single opening curlies for inline Active CSS and JavaScript prior to insertion into the DOM.
	str = str.replace(/_ACSS_later_brace_start/g, '{');

	// Now add config to the DOM.
	if (str.indexOf('<style ') !== -1 && str.indexOf('"text/acss"') !== -1) {
		// There's a good chance there is inline Active CSS to add to the config. Do that here.
		let fragRoot = document.createElement('div');
		fragRoot.innerHTML = str;
		let inlineConfigTags = fragRoot.querySelectorAll('style[type="text/acss"]');
		if (inlineConfigTags) {
			_getInline(inlineConfigTags);
		}
		str = fragRoot.innerHTML;	// needed to get all the IDs set up during this.
	}
	return str;
};

const _checkCond = condObj => {
	let { commandName, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState } = condObj;
	let condVals, condValsLen, n;

	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			evType,
			str: aV,
			obj: el,
			varScope
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	aV = _resolveVars(strObj.str, strObj.ref);

	condVals = aV.replace(/_ACSSEscComma/g, ',').split('_ACSSComma');
	condValsLen = condVals.length;

	for (n = 0; n < condValsLen; n++) {
		let cObj = {
			func,
			actName: commandName,
			secSel: 'conditional',
			secSelObj: el,
			actVal: condVals[n].trim(),
			primSel: sel,
			obj: el,
			e: eve,
			doc,
			ajaxObj,
			component,
			compDoc,
			varScope
		};
		if (_c[func](cObj, scopedProxy, privVarScopes, flyConds, _run) !== actionBoolState) {
			return false;	// Barf out immediately if it fails a condition.
		}
	}

	return true;
};

const _checkScopeForEv = (evScope) => {
	let parentComponentDetails = compParents[evScope];
	if (parentComponentDetails && parentComponentDetails.evScope && parentComponentDetails.evScope != evScope) {
		// Events need to run in the component context they are in. Hence these do need to be set per selector check.
		return {
			compDoc: parentComponentDetails.compDoc,
			topVarScope: parentComponentDetails.varScope,
			evScope: parentComponentDetails.evScope,
			component: ((parentComponentDetails.component) ? '|' + parentComponentDetails.component : null),
			strictPrivateEvs: parentComponentDetails.strictPrivateEvs,
			privateEvs: parentComponentDetails.privateEvs
		};
	}
	return false;
};

const _cloneAttrs = (el, srcEl) => {
	let attr, attrs = Array.prototype.slice.call(srcEl.attributes);
	for (attr of attrs) {
		if (attr.nodeName == 'href') continue;	// skip the href - we've already got it, otherwise we wouldn't be here.
		// Overwrite what is there, but only if it doesn't exist already.
		if (attr.nodeName == 'class') {
			ActiveCSS._addClassObj(el, attr.nodeValue);
		} else {
			if (!el.getAttribute(attr.nodeName)) el.setAttribute(attr.nodeName, attr.nodeValue);
		}
	}
	el.__acssNavSet = 1;
};

const _deleteIDVars = activeID => {
	delete clickOutsideSels[activeID];
	delete idMap[activeID];
	delete varInStyleMap[activeID];
	delete elObserveTrack[activeID];
};

const _deleteScopeVars = varScope => {
	let i, scopePref = varScope + '.', scopeNum = varScope.substr(1);
	delete scopedProxy[varScope];
	delete scopedData[varScope];
	for (i in scopedData) {
		if (i.startsWith('i' + scopeNum + 'HOST')) {
			delete scopedData[i];
		}
	}
	delete actualDoms[varScope];
	delete compPending[varScope];
	delete compParents[varScope];
	delete compPrivEvs[varScope];
	delete privVarScopes[varScope];
	delete strictCompPrivEvs[varScope];
	delete strictPrivVarScopes[varScope];
	if (shadowObservers[varScope]) shadowObservers[varScope].disconnect();
	delete shadowObservers[varScope];
	for (i in varMap) {
		if (i.startsWith(scopePref)) {
			delete varMap[i];
		}
	}
	delete varStyleMap[varScope];
};

const _escapeInline = (str, start) => {
	// Escape all single opening curlies so that the parser will not substitute any variables into the embedded Active CSS or JS.
	// This runs immediately on an ajax return string for use by {$STRING} and the result is stored, so it is only ever run once for speed.
	// This gets unescaped prior to insertion into the DOM.
	let end = start.split(' ')[0];
	let reg = new RegExp('<' + start + '([\\s\\S]*?)>([\\s\\S]*?)</' + end + '>', 'gmi');
	str = str.replace(reg, function(_, inn, inn2) {
		return '<' + start + inn + '>' + inn2.replace(/\{/g, '_ACSS_later_brace_start') + '</' + end + '>';
	});
	return str;
};

const _handleClickOutside = (el, e) => {
	// Does this element pass the click outside test?
	// Iterate the click outside selectors from the config.
	let cid, clickOutsideObj;
	for (cid in clickOutsideSels) {
		// Check the state of the clickoutside for this container. Will be true if active.
		if (typeof clickOutsideSels[cid][0] !== 'undefined' && clickOutsideSels[cid][0] === true) {
			// Does this clicked object exist in the clickoutside main element?
			clickOutsideObj = idMap[cid];
			if (!clickOutsideObj || supportsShadow && el.shadowRoot || el.isSameNode(clickOutsideObj)) continue;
			if (!clickOutsideObj.contains(el)) {
				// This is outside.
				// Get the component, scope, etc. for this element if there is component.
				let compDetails = _componentDetails(clickOutsideObj);
				if (_handleEvents({ obj: clickOutsideObj, evType: 'clickoutside', eve: e, component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope, otherObj: el })) {	// clickoutside sends the target also.
					if (!clickOutsideSels[cid][1]) {
						// This is a blocking click outside, so cancel any further actions.
						return false;
					}
				}
			}
		}
	}
	return true;
};

const _handleEvents = evObj => {
	let { obj, evType, onlyCheck, otherObj, eve, afterEv, origObj, origO, runButElNotThere, evScope, compDoc, _maEvCo } = evObj;
	let varScope, thisDoc;
	thisDoc = (compDoc) ? compDoc : document;
	let topVarScope = evObj.varScope;
	let component = (evObj.component) ? '|' + evObj.component : null;
	// Note: obj can be a string if this is a trigger, or an object if it is responding to an event.
	if (evType === undefined) return false;
	if (typeof obj !== 'string') {
		if (!obj) return false;
		if (evType == 'draw') obj._acssDrawn = true;	// Draw can manually be run twice, but not by the core as this is checked elsewhere.
	}
	if (!selectors[evType]) return;		// No selectors set for this event.

	let selectorList = [];
	// Handle all selectors.
	let selectorListLen = selectors[evType].length;
	let i, testSel, debugNot = '', compSelCheckPos, useForObserveID;

	// These variables change during the event flow, as selectors found to run need to run in the appropriate component context.
	let componentRefs = { compDoc, topVarScope, evScope, component, strictPrivateEvs: strictCompPrivEvs[evScope], privateEvs: compPrivEvs[evScope] };
	let initialComponentRefs = componentRefs;

	let runGlobalScopeEvents = true;
	useForObserveID = (typeof obj === 'string') ? obj.substr(1) : _getActiveID(obj);

	if (component && !(typeof obj !== 'string' && (evType == 'draw' || evType == 'observe') && customTags.indexOf(obj.tagName) !== -1)) {
		// Split for speed. It could be split into document/shadow areas to make even faster, at the times of adding config.
		// Don't bother optimizing by trying to remember the selectors per event the first time so they can be reused later on. Been down that route already.
		// The DOM state could change at any time, thereby potential changing the state of any object, and it's more trouble than it's worth to keep track of it
		// on a per object basis. It is fine as it is working dynamically. If you do have a go, you will need to consider things like routing affecting DOM
		// attributes, adding/removing attributes, properties, plus monitoring all objects for any external manipulation. It's really not worth it. This code is
		// short and fast enough on most devices.

		// Events have an additional action in Active CSS. They can bubble up per component. So a selector in a higher component will be inherited by a lower
		// component if the mode of the lower component is set to open. If set to closed, only that component's event will be processed. The developer can
		// stop this event hierarchy bubbling by using the Active CSS prevent-event-default action command. It's like DOM bubbling, but for events.
		// In a function-based language using native event listeners this would be confusing, but in Active CSS it makes *visual* sense to do this as we are
		// not using native event listeners. Which is nice.
		// This behaviour is exactly the same for shadow DOMs and non-shadow DOM components. It is *not* element bubbling. It is event bubbling.
		// Element bubbling follows native rules. In non-shadow DOM components element bubbling is not affected by the mode of the component.
		// There is a component tree array, which is used to track if we've hit the document in our references. If we have we bomb out after that.
		// This is all managed before running any events on an object. We make a valid event selector list first and then do the work.
		// This next bit creates the valid list.

		while (true) {
			for (i = 0; i < selectorListLen; i++) {
				let primSel = selectors[evType][i];
				compSelCheckPos = primSel.indexOf(':');
				if (primSel.substr(0, compSelCheckPos) !== componentRefs.component) continue;
				testSel = primSel.substr(compSelCheckPos + 1);
				if (typeof obj !== 'string' && testSel.substr(0, 1) == '~') continue;
				// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
				if (afterEv && origObj) testSel = _replaceEventVars(testSel, origObj);
				if (testSel.indexOf('<') === -1 && !selectorList.includes(primSel)) {
				    if (testSel == '&') {
						selectorList.push({ primSel, componentRefs });
				    } else {
						if (typeof obj !== 'string') {
						    try {
								if (obj.matches(testSel)) {
									selectorList.push({ primSel, componentRefs });
						    	} else {
									_setUpForObserve(useForObserveID, 'i' + primSel, 0);
									elObserveTrack[useForObserveID]['i' + primSel][0].ran = false;
						    	}
						    } catch(err) {
						        _warn(testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
							}
						} else {
							if (obj == testSel) {
								selectorList.push({ primSel, componentRefs });
							}
						}
					}
				}
			}
			if (!componentRefs.strictPrivateEvs && ['beforeComponentOpen', 'componentOpen'].indexOf(evType) === -1) {
				componentRefs = _checkScopeForEv(componentRefs.evScope);
				if (componentRefs !== false) continue;
			} else {
				// This component is closed. We don't go any higher.
				runGlobalScopeEvents = false;
			}
			break;
		}
   	}
   	if (runGlobalScopeEvents) {
		componentRefs = initialComponentRefs;
		for (i = 0; i < selectorListLen; i++) {
			let primSel = selectors[evType][i];
			if (primSel.substr(0, 1) == '|' || typeof obj !== 'string' && primSel.substr(0, 1) == '~') continue;
			// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
			testSel = (afterEv && origObj) ? _replaceEventVars(primSel, origObj) : primSel;

			if (testSel.indexOf('<') === -1 && !selectorList.includes(primSel)) {
				if (typeof obj !== 'string') {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push({ primSel, componentRefs });
				    	} else {
							_setUpForObserve(useForObserveID, 'i' + primSel, 0);
							elObserveTrack[useForObserveID]['i' + primSel][0].ran = false;
						}

				    } catch(err) {
				        _warn(testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
					}
				} else {
					if (obj == testSel) {
						selectorList.push({ primSel, componentRefs });
					}
				}
			}
		}
	}

	if (typeof obj === 'string') {
		// handle events has been called with a string rather than an object in this case. Use the original real object if there is one.
		obj = (origObj) ? origObj : obj;
	}

	let sel;
	if (!useForObserveID) useForObserveID = obj;

	selectorListLen = selectorList.length;
	let actionName, ifrSplit, ifrObj, conds = [], cond, condSplit, passCond;
	let clause, clauseCo = 0, clauseArr = [];
	// All conditionals for a full event must be run *before* all actions, otherwise we end up with confusing changes within the same event which makes
	// setting conditionals inconsistent. Like checking if a div is red, then setting it to green, then checking if a div is green and setting it to red.
	// Having conditionals dynamically checked before each run of actions means the actions cancel out. So therein lies confusion. So all conditionals
	// must run for a specific event on a selector *before* all actions start.
	for (sel = 0; sel < selectorListLen; sel++) {
		let primSel = selectorList[sel].primSel;
		let { compDoc, topVarScope, evScope, component } = selectorList[sel].componentRefs;
		component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.
		if (config[primSel] && config[primSel][evType]) {
			if (onlyCheck) return true;	// Just checking something is there. Now we have established this, go back.
			for (clause in config[primSel][evType]) {
				clauseCo++;
				let condObj = {
					el: obj,
					sel,
					clause,
					evType,
					ajaxObj: otherObj,
					doc: thisDoc,
					varScope: topVarScope,
					component,
					eve,
					compDoc
				};
				let condRes = true;
				if (clause != '0') condRes = _passesConditional(condObj);

				if (evType == 'observe') {
					// Handle observed elements that have ACSS conditionals.
					// Dont run custom selectors that don't have ACSS conditionals as these will just run all the time.
					if (clause == '0' && typeof obj === 'string' && primSel.substr(0, 1) == '~') {
						_err('Cannot run an observe event on a custom selector that has no conditional: ' + primSel + ':observe');
					}
					_setUpForObserve(useForObserveID, 'i' + primSel, clause);
					if (!condRes) elObserveTrack[useForObserveID]['i' + primSel][clause].ran = false;
				}
				if (condRes) clauseArr[clauseCo] = clause;	// This condition passed. Remember it for the next bit.
			}
		}
	}

	clauseCo = 0;
	subEventCounter++;

	eventsLoop: {
		for (sel = 0; sel < selectorListLen; sel++) {
			let primSel = selectorList[sel].primSel;
			let { compDoc, topVarScope, evScope, component } = selectorList[sel].componentRefs;
			component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.
			if (config[primSel] && config[primSel][evType]) {
				let useForObservePrim = 'i' + primSel;
				for (clause in config[primSel][evType]) {
					clauseCo++;
					passCond = '';
					if (clause != '0') {	// A conditional is there.
						if (clauseArr[clauseCo] === undefined) continue;	// The conditional failed earlier.
						// This conditional passed earlier - we can run it.
						passCond = clauseArr[clauseCo];
					}
					if (evType == 'observe') {
						if (elObserveTrack[useForObserveID][useForObservePrim][clause].ran === true) continue;	// already been run.
						elObserveTrack[useForObserveID][useForObservePrim][clause].ran = true;
						// This will subsequently get changed to false if the same condition on the same element fails.
					}

					// Now that we know what event to run, run the event. This is a specific event declaration under a certain circumstance,
					// with conditionals set or not set for this specific event.
					// The code for this has been kept separate, as this flow can be stopped and restarted with the await syntax.
					// All target selectors run one after the other, hence the separation for this is above the running of
					// an individual target selector. Variables can be dynamically used in target selector declarations, so that evaluation must also happen
					// with due regard to the await flow.
					// "await" effectively affects only one specific event, hence the function is called "_performEvent" and not "_performEvents".
					// When resuming an event after an await or pause - it comes back in via a call to _performEvent with the object below and a
					// "resumption" object which contains the location in the event loop to resume from. The whole loop is needed to maintain a duplicate
					// of that which was paused.
					let loopObj = {
						primSel,
						chilsObj: config[primSel][evType][clause],
						obj,
						compDoc,
						evType,
						varScope: topVarScope,
						evScope,
						evObj,
						otherObj,
						origO,
						passCond,
//						sel,
						component,
//						selectorList,
						eve,
						_maEvCo,
						_subEvCo: 'i' + subEventCounter,
						runButElNotThere
					};
					// Now add a copy of this original loop construct, within itself, for use by await & pause for resuming an identical loop.
					let loopObjCopy = _clone(loopObj);
					loopObj.origLoopObj = loopObjCopy;

					if (_performEvent(loopObj) === false) break eventsLoop;
				}
			}
		}
	}

	return true;
};

const _handleFunc = function(o, delayActiveID=null, runButElNotThere=false) {
	// Store sync queue if necessary.
	let syncQueueSet = _isSyncQueueSet(o._subEvCo);

	// Set async flag if this is a true asynchronous command.
	o.isAsync = ASYNCCOMMANDS.indexOf(o.func) !== -1;
	o.isTimed = o.actVal.match(TIMEDREGEX);
	runButElNotThere = o.elNotThere || runButElNotThere;

	if (_syncStore(o, delayActiveID, syncQueueSet, runButElNotThere)) return;

	// Check and set up sync commands.
	_syncCheckAndSet(o, syncQueueSet);

	// Handle the pause command, which uses a similar method as "await".
	if (o.func == 'Pause') {
		_pauseHandler(o);
		return;
	}

	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = (o.evScope ? o.evScope : 'doc') + o.secSel;
	} else {
		delayRef = _getActiveID(o.secSelObj);
	}

	// Delayed / interval events need to happen at this level.
	if (o.isTimed) {
		let o2 = _clone(o), delLoop = ['after', 'every'], aftEv;
		let splitArr, tid, scope;
		for (aftEv of delLoop) {
			splitArr = _delaySplit(o2.actVal, aftEv, o.varScope);
			scope = (o.varScope) ? o.varScope : 'main';
			if (splitArr.lab) splitArr.lab = scope + splitArr.lab;
			if (typeof splitArr.tim == 'number' && splitArr.tim >= 0) {
				o2.actVal = splitArr.str;
				o2.actValSing = o2.actVal;
				delayArr[delayRef] = (delayArr[delayRef] !== undefined) ? delayArr[delayRef] : [];
				delayArr[delayRef][o2.func] = (delayArr[delayRef][o2.func] !== undefined) ? delayArr[delayRef][o2.func] : [];
				delayArr[delayRef][o2.func][o2.actPos] = (delayArr[delayRef][o2.func][o2.actPos] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos] : [];
				delayArr[delayRef][o2.func][o2.actPos][o2.intID] = (delayArr[delayRef][o2.func][o2.actPos][o2.intID] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos][o2.intID] : [];
				if (delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]) {
//					console.log('Clear timeout before setting new one for ' + o2.func + ', ' + o2.actPos + ', ' + o2.intPos + ', ' + o2.loopRef);
					_clearTimeouts(delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]);
					_removeCancel(delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef);
				}
				o2.delayed = true;
				if (aftEv == 'after') {
					_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setTimeout(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
					 _nextFunc(o);
			 		return;
				}
				o2.interval = true;
				o2.origActValSing = o2.actValSing;
				_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
				// Carry on down and perform the first action. The interval has been set.
				o.interval = true;
				o.actValSing = splitArr.str;
			}
		}
	} else {
		o.actValSing = o.actVal;
	}

	// Remove any labels from the command string. We can't remove this earlier, as we need the label to exist for either "after" or "every", or both.
	if (o.actValSing.indexOf(' label ') !== -1) {
		o.actValSing = o.actValSing.replace(LABELREGEX, '');
	}

	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Has this action been cancelled? If so, skip the action and remove the cancel.
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][o.func] && cancelCustomArr[delayRef][o.func][o.actPos] &&
				cancelCustomArr[delayRef][o.func][o.actPos][o.intID] && cancelCustomArr[delayRef][o.func][o.actPos][o.intID][o.loopRef]
			) {
			_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
			 _nextFunc(o);
			return;
		}
	}

	// Is this a non-delayed action, if so, we can skip the cancel check.
	if (o.delayed && cancelIDArr[delayRef] && cancelIDArr[delayRef][o.func]) {
		_nextFunc(o);
		return;
	}

	o.actValSing = ActiveCSS._sortOutFlowEscapeChars(o.actValSing).trim();

	if (['Var', 'VarDelete'].indexOf(o.func) !== -1) {
		// Special handling for var commands, as each value after the variable name is a JavaScript expression, but not within {= =}, to make it quicker to type.
		o.actValSing = o.actValSing.replace(/__ACSS_int_com/g, ',');
	} else {
		let strObj = _handleVars([ 'rand', ((!['CreateCommand', 'CreateConditional', 'Eval', 'Run'].includes(o.func)) ? 'expr' : null), 'attrs', 'strings', 'scoped' ],
			{
				str: o.actValSing,
				func: o.func,
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope: o.varScope
			}
		);
		o.actVal = _resolveVars(strObj.str, strObj.ref, o.func);
	}

	o.actVal = o.actVal.replace(/_ACSS_later_escbrace_start/gm, '{');
	o.actVal = o.actVal.replace(/_ACSS_later_escbrace_end/gm, '}');

	// Show debug action before the function has occured. If we don't do this, the commands can go out of sequence in the Panel and it stops making sense.
	if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
		_debugOutput(o);	// A couple of extra objects variables are set in here, and we want them later for the feedback results (not yet implemented fully).
	}

	let cssVariableChange;
	if (typeof _a[o.func] !== 'function') {
		// Apply this as a CSS style if it isn't a function.
		if (o.func.startsWith('--')) {
			_setCSSVariable(o);
			cssVariableChange = true;
		} else {
			if (_isConnected(o.secSelObj)) {
				o.secSelObj.style[o.actName] = o.actVal;
			}
		}
	} else {
		// Allow the variables for this scope to be read by the external function - we want the vars as of right now.
		let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');
		o.vars = scopedProxy[compScope];
		// Run the function.
		_a[o.func](o, scopedProxy, privVarScopes, flyCommands, _run);
	}

	if (o.interval) {
		// Restore the actVal to it's state prior to variable evaluation so interval works correctly.
		o.actVal = o.origActValSing;
		o.actValSing = o.actVal;
	} else if (!o.interval && delayActiveID) {
		// We don't cleanup any timers if we are in the middle of an interval. Only on cancel, or if the element is no longer on the page.
		// Also... don't try and clean up after a non-delayed action. Only clean-up here after delayed actions are completed. Otherwise we get actions being removed
		// that shouldn't be when clashing actions from different events with different action values, but the same everything esle.
		_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
	}

	// Handle general "after" callback. This check on the name needs to be more specific or it's gonna barf on custom commands that contain ajax or load. FIXME!
	if (!cssVariableChange && !o.isAsync) {
		if (!runButElNotThere && (!o.secSelObj || !_isConnected(o.secSelObj))) o.secSelObj = undefined;
		_handleEvents({ obj: o.secSelObj, evType: 'after' + o.actName._ACSSConvFunc(), otherObj: o.secSelObj, eve: o.e, afterEv: true, origObj: o.obj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
	}

	// Restart the sync queue if await was used.
	if (!o.isAsync && _isSyncQueueSet(o._subEvCo)) {
		_syncRestart(o, o._subEvCo);
		return;
	}

 	_nextFunc(o);
 };

const _handleObserveEvents = (mutations, dom, justCustomSelectors=false) => {
	// This can get called a lot of times in the same event stack, and we only need to do once per criteria, so process a queue.
	if (!dom) dom = document;	// Don't move this into parameter default.

	// This can get called a lot of times, so process a queue and don't queue duplicate calls back into this function.
	// _handleEvents, which is used in here, can generate more calls back into this function, which is necessary, but not if we already have the same
	// thing already queued.
	// The key to this is to remember that we do process this function if dom + justCustomSelectors is a unique entry for this queue.
	// observeEventsQueue and observeEventsMid are objects so that states can be deleted cleanly when ended with minimal fuss.
	let ref, skipQueue;
	if (dom.nodeType == 9) {
		// This is the document.
		ref = 'doc' + justCustomSelectors;
	} else {
		// This is a document fragment.
		let domFirstChild = dom.firstChild;
		if (domFirstChild) {
			ref = (domFirstChild._acssActiveID) ? dom.firstChild._acssActiveID : _getActiveID(dom.firstChild).substr(3);
		} else {
			// It shouldn't really get in here, but if it does due to an empty component, just skip the queueing and run.
			skipQueue = true;
		}
	}

	if (!skipQueue) {
		if (observeEventsQueue[ref]) return;		// Already queued to the end of the event stack - skip.
		if (observeEventsMid[ref]) {
			observeEventsQueue[ref] = true;
			setTimeout(() => {
				delete observeEventsQueue[ref];
				_handleObserveEvents(mutations, dom, justCustomSelectors);
			}, 0);
		}
		observeEventsMid[ref] = true;
	}

	// Handle cross-element observing for all observe events.
	let evType = 'observe', i, primSel, compSelCheckPos, testSel, compDetails;
	if (!selectors[evType]) return;

	// Loop observe events.
	let selectorListLen = selectors[evType].length;
	for (i = 0; i < selectorListLen; i++) {
		primSel = selectors[evType][i];
		compSelCheckPos = primSel.indexOf(':');
		testSel = primSel.substr(compSelCheckPos + 1);
		if (testSel.substr(0, 1) == '~') {
			// This is a custom selector.
			_handleEvents({ obj: testSel, evType });
		} else if (!justCustomSelectors) {
			let compDetails;
			let sel = (primSel.substr(0, 1) == '|') ? testSel : primSel;

			dom.querySelectorAll(sel).forEach(obj => {		// jshint ignore:line
				// There are elements that match. Now we can run _handleEvents on each one to check the conditionals, etc.
				// We need to know the component details if there are any of this element for running the event so we stay in the context of the element.
				if (obj === document.body) {
					_handleEvents({ obj, evType });
				} else {
					compDetails = _componentDetails(obj);
					_handleEvents({ obj, evType, component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });
				}
			});
		}
	}

	if (!skipQueue) delete observeEventsMid[ref];
};

const _handleShadowSpecialEvents = shadowDOM => _handleObserveEvents(null, shadowDOM);

const _handleSpaPop = (e, init) => {
	let loc, realUrl, url, pageItem, pageGetUrl, manualChange, n, triggerOfflinePopstate = false, thisHashStr = '', multipleOfflineHash = false;

	if (init|| !init && !e.state) {
		// This is a manual hash change. By this point, a history object has been created which has no internal state object. So that needs creating and
		// this existing history object needs replacing.
		manualChange = true;
	}

	hashEventTrigger = false;

	loc = window.location;
	if (manualChange) {
		realUrl = loc.href;
	} else {
		realUrl = e.state.url;
	}

	// Get the details of the hash event if there is one.
	if (loc.protocol == 'file:') {
		// The new URL handling will not work with file:// URLs, hence we also need this alternative handling to get the details.
		// (ie. the local files could be anywhere on someone's file system. We can't easily find where the page root is, not for every scenario.)

		// Handle the standalone local SPA format where '/' will be in the URL if there is a hash.
		url = realUrl;
		if (loc.hash != '') {
			// If this is an offline file and there is a hash, then the hash should be the @pages ref.
			pageGetUrl = loc.hash.substr(1);	// Remove the hash at the start.
			let anotherHash = pageGetUrl.indexOf('#');
			if (anotherHash !== -1) {
				// There's at least one more hash. Extract the url up to the first hash - that is our root.
				thisHashStr = pageGetUrl.substr(anotherHash);
				pageGetUrl = pageGetUrl.substr(0, anotherHash);
				multipleOfflineHash = true;
			}
		} else {
			// If there is no hash, assume the url is "/" for the benefit of @pages.
			// This should have a command that initialises this as an SPA rather than assume that every file:// use is an offline SPA.
			pageGetUrl = '/';
		}
		pageItem = _getPageFromList(pageGetUrl);
		triggerOfflinePopstate = true;

	} else {
		if (manualChange) {
			let full = new URL(realUrl);
			url = full.pathname + full.search;
			pageItem = _getPageFromList(url);
		} else {
			pageItem = e.state;
			url = e.state.url;
		}

		thisHashStr = loc.hash;
	}

	// Break up any hashes into an array for triggering in _trigHashState when prompted (either immediately or after ajax events).

	if (thisHashStr != '') {
		// Get the hash trigger if there is one.
		let hashSplit = thisHashStr.split('#');
		let hashSplitLen = hashSplit.length;
		for (n = 0; n < hashSplitLen; n++) {
			if (hashSplit[n] == '') continue;
			// Store the hash for when the page has loaded. It could be an embedded reference so we can only get the event once the page has loaded.
			hashEvents.push(hashSplit[n]);
			hashEventTrigger = true;
		}
	}

	let urlObj = { url };
	if (pageItem) urlObj.attrs = pageItem.attrs;

	if (manualChange) {
		// Handle immediate hash event if this is from a page refresh or a manual hash change.
		window.history.replaceState(urlObj, document.title, realUrl);
		_setUnderPage();
	}

	if (triggerOfflinePopstate) {
		// If this is an offline SPA and the first page has a hash, trigger the popstate action (not the event) so that we get the correct initial events firing.
		urlObj.attrs += ' href="' + pageGetUrl + '"';	// the href attr will otherwise be empty and not available in config if that's need for an event.
	}


	if (manualChange && hashEventTrigger && !multipleOfflineHash) {
		// Page should be drawn and config loaded, so just trigger the hash event immediately if it isn't delayed.
		_trigHashState(e);
	}

	// Trigger the underlying page switch.
	let templ = document.querySelector('#data-acss-route');
	if ((!init ||
			init &&
			(hashEventTrigger || triggerOfflinePopstate) &&
			window.location.href.slice(-2) != '#/' &&
			(triggerOfflinePopstate || !triggerOfflinePopstate && currUnderPage != window.location.pathname + window.location.search)
			) &&
			templ &&
			urlObj.attrs
		) {
		templ.removeChild(templ.firstChild);
		templ.insertAdjacentHTML('beforeend', '<a ' + urlObj.attrs + '>');
		ActiveCSS.trigger(templ.firstChild, 'click', null, null, null, null, e);

		// We've hit the end of this event. Run any hash events if any are set if they haven't been delayed by an ajax call.
		_trigHashState(e);

	} else if (!urlObj.attrs) {
		// Fallback to regular page load if underlying page is not found in @pages.
		let url = new URL(realUrl);
		if (url.href != realUrl) {
			window.location.href = realUrl;
		}
	}

};

const _handleVarsInJS = function(str, varScope) {
	/**
	 * "str" is the full JavaScript content that is being prepared for evaluation.
	 * This function finds any "vars" line that declares any Active CSS variables that will be used, and locates and substitutes these variables into the code
	 * before evaluation. A bit like the PHP "global" command, except in this case we are not declaring global variables. We are limiting all variables to the
	 * scope of Active CSS. All the ease of global variables, but they are actually contained within Active CSS and not available outside Active CSS.
	 * 1. Names of variables get substituted with reference to the scopedProxy container variable for the scoped variables, which is private to the Active CSS IIFE.
	 *		This is literally just an insertion of "scopedProxy." and the appropriate scope before any matching variable name. The scope is worked out on the fly
	 *		at the moment the command (like "run"), or referenced command (like with "create-command") is run. So it works out the scopes dynamically every time. It
	 *		needs to run every time, as commands tend to be able to be used inside difference variable scopes, so each time there is potentially a different set of scoped
	 *		variables.
	 * 2. Variables enclosed in curlies get substituted with the value of the variable itself. This would be for rendered contents.
	 * Note: This could be optimised to be faster - there's bound to be some ES6 compatible regex magic that will do the job better than this.
	*/
	let mapObj = {}, mapObj2 = {};
	let found = false;
	str = str.replace(/[\s]*vars[\s]*([\u00BF-\u1FFF\u2C00-\uD7FF\w\, \$]+)[\s]*\;/gi, function(_, varList) {
		// We should have one or more variables in a comma delimited list. Split it up.
		let listArr = varList.split(','), thisVar, varObj;
		// Remove dupes from the list by using the Set command.
		listArr = [...new Set(listArr)];
		let negLookLetter = '(\\b)';		// Specifies same-type boundary to limit regex to that exact variable. For var starting with letter.
		let negLookDollar = '(\\B)';		// Specifies same-type boundary to limit regex to that exact variable. For var starting with $.
		found = true;
		for (thisVar of listArr) {
			thisVar = thisVar.trim();
			let negLookStart = thisVar.startsWith('$') ? negLookDollar : negLookLetter;
			let negLookEnd = thisVar.endsWith('$') ? negLookDollar : negLookLetter;
			let escapedVar = thisVar.replace(/\$/gm, '\\$');
			mapObj[negLookStart + '(' + escapedVar + ')' + negLookEnd] = '';
			// Variable can be evaluated at this point as the command runs dynamically. This is not the case with create-command which tends to run in places like
			// body:init and the actual command referenced needs to be dynamically.
			// So a different method is used there. But here for speed we can do it dynamically before the command is actually run.
			varObj = _getScopedVar(thisVar, varScope);
			mapObj2[thisVar] = varObj.fullName;
		}
		return '';	// Return an empty line - the vars line was Active CSS syntax, not native JavaScript.
	});

	if (found) {
		// We don't want variables in quotes to show the internal variable name. And the solution needs to cater for escaped quotes.
		// At this point there is an array of regexes for all the variables we want to replace.
		// Bear in mind that there is a lot of regex stuff going on here.
		str = str.replace(/\\"/g, 'cjs_tmp-dq');
		str = str.replace(/\\'/g, 'cjs_tmp-sq');
		// By this point we should have a handy array of all the variables to be used in the native JavaScript.
		// We are going to used this as a regex map to substitute scoped prefixes into the code. But we use a non-regex replace object.
		str = ActiveCSS._mapRegexReturn(mapObj, str, mapObj2, true);	// true = case-sensitive.
		// Remove any substituted vars prefixes in quotes, as the user won't want to see those in their internal form.
		// Remove any /scopedProxy.*./ anywhere in single or double quotes catering for escaped quotes, this whole function could be optimised.
		str = str.replace(/(["|'][\s\S]*?["|'])/gim, function(_, innards) {
			return innards.replace(/scopedProxy\.[\u00BF-\u1FFF\u2C00-\uD7FF\w\$]+\./g, '');
		});
		str = str.replace(/cjs_tmp\-dq"/g, '\\"');
		str = str.replace(/cjs_tmp\-sq/g, "\\'");
	}
	return str;
};

const _mainEventLoop = (typ, e, component, compDoc, varScope) => {
	if (e.target.id == 'cause-js-elements-ext') return;	// Internally triggered by extension to get bubble state. Don't run anything.
	let el;
	let bod = (e.target == self || e.target.body);
	if (typ != 'click' && bod) {
		// Run any events on the body, followed by the window.
		_handleEvents({ obj: 'body', evType: typ, eve: e });
		_handleEvents({ obj: 'window', evType: typ, eve: e });
		return;
	} else if (e.primSel) {
		el = e.secSelObj;
	} else {
		if (typ == 'click' && e.button !== 0) return;		// We only want the left button.
		el = e.target;	// Take in the object if called direct, or the event.
	}
	if (typ == 'click' && e.primSel != 'bypass') {
		// Check if there are any click-away events set.
		// true above here means just check, don't run.
		if (clickOutsideSet && !_handleClickOutside(el, e)) {
			if (!e.primSel) {
				e.preventDefault();
			}
			return false;
		}
	}

	let composedPath;
	composedPath = _composedPath(e);

	// Each real event gets it's own counter as a pointer to a central real object event.
	// This is currently used for the propagation state, but could be added to for anything else that comes up later.
	// It is empty at first and gets added to when referencing is needed.
	mainEventCounter++;
	maEv[mainEventCounter] = { };

	// Certain rules apply when handling events on the shadow DOM. This is important to grasp, as we need to reverse the order in which they happen so we get
	// natural bubbling, as Active CSS by default uses "capture", which goes down and then we manually go up. This doesn't work when using shadow DOMs, so we have
	// to get a bit creative with the handling. Event listeners occur in the order of registration, which will always give us a bubble down effect, so we have to
	// do a manual bubble up and skip the first events if they are not related to the document or shadow DOM of the real target.
	let realItem = composedPath[0];
	if (_getRootNode(realItem).isSameNode(document) || e.target.isSameNode(realItem)) {
		// We do not run parent events of shadow DOM nodes - we only process the final events that run on the actual target, and then bubble up through
		// composedPath(). *Fully* cloning the event object (with preventDefault() still functional) is not currently supported in browsers, understandably, so
		// re-ordering of real events is not possible, so we have to skip these. The reason being that preventDefault will break on events that have already bubbled,
		// and cloning and running an event object later on means that any bubbling will happen before the re-run, thus rendering preventDefault() unusable, and we
		// do still need it for cancelling browser behaviour. So therefore preventDefault() will correctly fatally error if cloned and re-used. [edit] Possibly could have
		// created a new event, but that may have led us into different problems - like unwanted effects outside of the Active CSS flow.
		let compDetails;
		let navSet = false;
		for (el of composedPath) {
			if (typ == 'mouseover' && !bod) {
				if (!navSet && el.tagName == 'A' && el.__acssNavSet !== 1) {
					// Set up any attributes needed for navigation from the routing declaration if this is being used.
					_setUpNavAttrs(el);
					navSet = true;
				}
			}
			if (el.nodeType !== 1) continue;
			// This could be an object that wasn't from a loop. Handle any ID or class events.
			if (!navSet && typ == 'click' && el.tagName == 'A' && el.__acssNavSet !== 1) {
				// Set up any attributes needed for navigation from the routing declaration if this is being used.
				_setUpNavAttrs(el);
				navSet = true;
			}
			// Is this in the document root or a shadow DOM root?
			compDetails = _componentDetails(el);
			_handleEvents({ obj: el, evType: typ, eve: e, component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope, _maEvCo: mainEventCounter });
			if (!el || !e.bubbles || el.tagName == 'BODY' || maEv[mainEventCounter]._acssStopEventProp) break;		// el can be deleted during the handleEvent.
		}
		if (!maEv[mainEventCounter]._acssStopEventProp && document.parentNode) _handleEvents({ obj: window.frameElement, evType: typ, eve: e });
	}

	// Remove this event from the mainEvent object. It shouldn't be done straight away as there may be stuff being drawn in sub-DOMs.
	// It just needs to happen at some point, so we'll say 10 seconds.
	setTimeout(function() { maEv = maEv.filter(function(_, i) { return i != mainEventCounter; }); }, 10000);
};

const _nextFunc = o => {
	let counter = o.actPos + 1;
	if (counter < o._funcObj.pars.actValsLen) {
		let funcOCopy = _clone(o._funcObj.oCopy);
		let funcOPars = _clone(o._funcObj.pars);
		_actionValLoopDo(funcOCopy, funcOPars, o._funcObj.obj, o._funcObj.runButElNotThere, counter);
	}
};

// This has been set up to only run when Active CSS setup has fully loaded and completed.
ActiveCSS._nodeMutations = function(mutations, observer, dom=document, insideShadowDOM=false) {
	_handleObserveEvents(mutations, dom);

	mutations.forEach(mutation => {
		// Handle any observe events on the node itself.
		if (mutation.type == 'childList') {
			if (mutation.addedNodes) {
				if (DEVCORE) {
					mutation.addedNodes.forEach(nod => {
						if (!(nod instanceof HTMLElement)) return;
						// Handle the addition of embedded Active CSS styles into the config via DevTools. Config is already loaded if called via ajax.
						if (_isACSSStyleTag(nod) && !nod._acssActiveID && !_isInlineLoaded(nod)) {
							_regenConfig(nod, 'addDevTools');
						} else if (!insideShadowDOM) {		// cannot have ACSS style tags inside shadow DOM elements currently.
							nod.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
								if (!nod._acssActiveID && !_isInlineLoaded(nod)) _regenConfig(obj, 'addDevTools');
							});
						}
					});
				}
			}
		} else if (mutation.type == 'characterData' && !insideShadowDOM) {
			// Detect change to embedded Active CSS. The handling is just to copy the insides of the tag and replace it with a new one.
			// This will be sufficient to set off the processes to sort out the config.
			let el = mutation.target;
			if (el.nodeType == Node.TEXT_NODE && _isACSSStyleTag(el.parentElement)) {
				// We need to run this at the end of the call stack, otherwise we could clash with other stuff going on.
				setTimeout(function() {
					// This is an embedded Active CSS tag. Replace it so it triggers off the config changes.
					let parEl = el.parentElement;
					let newTag = '<style type="text/acss">' + parEl.innerText + '</style>';
					// Remove from the config first. If we remove the element after we've changed the content we get the scenario of the removal happening
					// after the addition and it buggers things up. So just do a manual removal.
					_regenConfig(parEl, 'remove');
					// Now we can safely add it.
					parEl.insertAdjacentHTML('beforebegin', newTag);	// Can't do a straight replace with a real node because of br tags being inserted.
					// Now change the type of the element so it doesn't get picked up in mutations.
					parEl.type = 'text/dummy';
					// Now it's safe to remove - it's not going to trigger a delete mutation.
					parEl.remove();
				}, 0);
			}
		}

		if (mutation.removedNodes) {
			mutation.removedNodes.forEach(nod => {
				if (!(nod instanceof HTMLElement)) return;
				// Now perform some clean-up on removed nodes. It doesn't have to be done immediately, so just do it after the current stack.
				// Note that nested shadow DOMs can also come into play here, and we need to clean up those too.
				setTimeout(function() {
					let ID = nod._acssActiveID;
					if (ID) {
						_deleteIDVars(ID);
						_deleteScopeVars('_' + ID.substr(3));
					}
					_recursiveScopeCleanUp(nod);

/*
					// This is handy for checking memory. Please don't remove.
					console.log('ActiveCSS._nodeMutations, scopedProxy:', scopedProxy,
						'scopedData:', scopedData,
						'varMap:', varMap,
						'varStyleMap:', varStyleMap,
						'clickOutsideSels:', varStyleMap,
						'idMap:', varStyleMap,
						'varInStyleMap:', varStyleMap,
						'compPending:', compPending,
						'compParents:', compParents,
						'compPrivEvs:', compPrivEvs,
						'actualDoms:', actualDoms,
						'delayArr:', delayArr,
						'idMap:', idMap,
						'cancelIDArr:', cancelIDArr,
						'cancelCustomArr:', cancelCustomArr
					);
*/
				}, 0);
			});
		}
	});
};

const _passesConditional = (condObj) => {
	let { el, sel, clause, evType, ajaxObj, doc, varScope, component, eve, compDoc } = condObj;
	// This takes up any conditional requirements set. Checks for "conditional" as the secondary selector.
	// Note: Scoped shadow conditionals look like "|(component name)|(conditional name)", as opposed to just (conditional name).

	let firstChar, chilsObj, key, obj, func, excl, i, checkExcl, exclLen, eType, eActual, exclArr, exclTargs, exclDoc, iframeID, aV;
	// Loop conditions attached for this check. Split conditions by spaces not in parentheses.

	clause = clause.replace(/(\(.*?\)|\{.*?\})/g, function(_) {
		return _.replace(/ /g, '_ACSSspace').replace(/,/g, '_ACSSEscComma');
	});

	let cond, conds = clause.split(/ (?![^\(\[]*[\]\)])/), rules, exclusions, nonIframeArr = [];

	let elC = (evType == 'clickoutside' && ajaxObj) ? ajaxObj : el;	// use click target if clickoutside.
	let actionBoolState = true;

	for (cond of conds) {
		cond = cond.replace(/_ACSSspace/g, ' ').replace(/__ACSSDBQuote/g, '"');

		let parenthesisPos = cond.indexOf('(');
		if (parenthesisPos === -1) {
			// Is this a built-in conditional? If so, check it has self as a default. If so, run it with self.
			// We can just check the CONDDEFSELF array to ascertain this.
			if (_condDefSelf(cond)) {
				// It can have defaults, set up parenthesisPos for later.
				parenthesisPos = cond.length;
				cond = cond + '(self)';
			}
		}
		if (parenthesisPos !== -1) {
			// This is a direct reference to a command. See if it is there.
			let commandName = cond.substr(0, parenthesisPos);
			actionBoolState = false;
			if (commandName.substr(0, 4) == 'not-') {
				func = commandName.substr(4);
			} else if (commandName.substr(0, 1) == '!') {
				func = commandName.substr(1);
			} else {
				actionBoolState = true;
				func = commandName;
			}

			func = func._ACSSConvFunc();
			if (_isCond(func)) {
				// Comma delimit for multiple checks in the same function.
				let aV = cond.slice(parenthesisPos + 1, -1).trim().replace(/"[^"]*"|(\,)/g, function(m, c) {
					// Split conditionals by comma.
				    if (!c) return m;
				    return '_ACSSComma';
				});
				let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
					{
						str: aV,
						func: 'Var',
						obj: el,
						secSelObj: el,
						varScope: varScope
					}
				);
				aV = _resolveVars(strObj.str, strObj.ref);
				if (!_checkCond({ commandName, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState })) {
					return false;
				}
			}
			continue;
		}
		if (component) {
			cond = '|' + component + '|' + cond;
			if (conditionals[cond] === undefined) {
				let condErr = cond.substr(component.length + 2);
				_err('Conditional ' + condErr + ' not found in config for component ' + component);
			}
		}
		rules = conditionals[cond];
		if (rules) {
			// This is reference to a custom conditional and not a conditional command.
			for (key in rules) {
				if (!rules.hasOwnProperty(key)) continue;
				obj = rules[key];
				if (obj.name.substr(0, 1) == '!') {
					actionBoolState = false;
					func = obj.name.substr(1);
				} else {
					actionBoolState = true;
					func = obj.name;
				}
				func = func._ACSSConvFunc();
				if (_isCond(func)) {
					// Call the conditional function is as close a way as possible to regular functions.

					// Comma delimit for multiple checks on the same statement.
					let aV = obj.value.replace(/"[^"]*"|(\,)/g, function(m, c) {
						// Split conditionals by comma.
					    if (!c) return m;
					    return '_ACSSComma';
					});

					if (!_checkCond({ commandName: obj.name, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState })) {
						return false;
					}
				}
			}
		} else {
			// Check if this is a direct reference to a conditional command.
			_err('Conditional ' + cond + ' not found in config for document scope.');
		}
	}
	// Gotten through all the conditions - event actions are ok to run.
	return true;
};

const _performAction = (o, runButElNotThere=false) => {
	// All attr... actions pass through here.
	if (o.doc.readyState && o.doc.readyState != 'complete') {
		// Iframe not ready, come back to this in 200ms.
		setTimeout(_performAction.bind(this, o), 200);
		return false;
	}
	// Just do the actions with no loops on the secSel.
	return _performActionDo(o, null, runButElNotThere);		// eturn false if no further actions are to be run.
};

const _performActionDo = (o, loopI=null, runButElNotThere=false) => {
	let { _imStCo, secSelEls } = o;

	// Substitute any ajax variable if present. Note {@i} should never be in secSel at this point, only a numbered reference.
	if (!o.secSel && !runButElNotThere) return;
	// Split action by comma.
	let newActVal = o.actVal;
	if (o.actVal.indexOf(',') !== -1) {	// Note this could be optimized with a single split regex.
		// Remove commas in brackets from what is coming up in the next replace.
		newActVal = newActVal.replace(/\(.*?\)/g, function(m, c) {
			return m.replace(/,/g, '_ACSStmpcomma_');
		});
		// Replace all commas not in quotes with a split delimiter for multiple action values.
		newActVal = newActVal.replace(/"[^"]*"|(\,)/g, function(m, c) {
		    if (!c) return m;
		    return '_ACSSComma';
		});
		// Put any commas in brackets back.
		newActVal = newActVal.replace(/_ACSStmpcomma_/g, ',');
	}
	if (['Var', 'VarDelete'].indexOf(o.func) !== -1) {
		// Special handling for var commands, as each value is a JavaScript expression, but not in {= =}, to make it quicker to type.
		newActVal = ActiveCSS._sortOutFlowEscapeChars(newActVal);
		// Now escape any commas inside any kind of brackets.
		newActVal = _escCommaBrack(newActVal, o);
	}
	// Store the original copies of the action values before we start looping secSels.
	let actValsLen, actVals = newActVal.split('_ACSSComma'), comm, activeID;
	actValsLen = actVals.length;
	let pars = { loopI, actVals, actValsLen };

	if (typeof o.secSel == 'string' && !['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Loop objects in secSel and perform the action on each one. This is used for the "parallel" event flow option on target selectors.
		let checkThere = false, activeID;
		if (o.secSel == '#') {
			_err(o.primSel + ' ' + o.event + ', ' + o.actName + ': "' + o.origSecSel + '" is being converted to "#". Attribute or variable is not present.');
		}
		let els = secSelEls;

		let elsTotal = els.length;
		let co = 0;

		// Parallel target selector event flow. Default event flow is handled in _performTargetOuter().
		// Loop this action command over each of the target selectors before going onto the next action command.
		if (els !== false) {
			els.forEach((obj) => {
				// Loop over each target selector object and handle all the action commands for each one.
				co++;
				checkThere = true;
				let oCopy = _clone(o);
				oCopy._elsTotal = elsTotal;
				oCopy._elsCo = co;

				_actionValLoop(oCopy, pars, obj);
			});
		}

		if (!checkThere) {
			if (o.ranAction === true) {
				// Element is no longer there - run anyway, as the target selector was only just removed.
				let oCopy = _clone(o);
				_actionValLoop(oCopy, pars, {}, true);	// run but element not there anymore, if it ever was.
			} else {
				// Element was never there in this run of target selector action commands.
				return false;
			}
		}
	} else {
		let oCopy = _clone(o);
		// Send the secSel to the function, unless it's a custom selector, in which case we don't.
		if (typeof oCopy.secSel == 'object') {
			_actionValLoop(oCopy, pars, oCopy.secSel);
		} else {
			// Is this a custom event selector? If so, don't bother trying to get the object. Trust the developer doesn't need it.
			if (runButElNotThere || ['~', '|'].includes(oCopy.secSel.substr(0, 1))) {
				_actionValLoop(oCopy, pars, {}, runButElNotThere);
			}
		}
/* 	Feedback commented out for the moment - this will be part of a later extension upgrade.
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			// Show any feedback available at this point. Note ajax call results will feedback elsewhere.
			_debugOutputFeedback(oCopy);
		}
*/
	}
	if (typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue')
		) {
		return;
	}
	return true;
};

const _performEvent = (loopObj) => {
	let stopImEdProp = false;
	let loopObjClone = _clone(loopObj);
	loopObj = null;
	if (loopObjClone.chilsObj !== false) {
		// Secondary selector loops go here.
		let secSelLoops;

		// Set property so we can immediate halt after an action for this event.
		// Used in the pause/await functionality to quit after a pause.
		immediateStopCounter++;
		let thisStopCounter = immediateStopCounter;
		imSt[thisStopCounter] = { };
		// Set loop counter. This is used to manage continue and break. It is set to 0 before any loops get processed, increments for each nested loop
		// and decrements when back in its outer loop.
		let loopCo = 0;

		for (secSelLoops in loopObjClone.chilsObj) {
			let loopObjTarg = _clone(loopObjClone);
			loopObjTarg.fullStatement = secSelLoops;
			loopObjTarg.secSelLoops = secSelLoops;
			loopObjTarg._imStCo = thisStopCounter;
			_performSecSel(loopObjTarg);
			// Note that stopImmedEvProp only works when there are no await or pause commands in any action commands in here.
			if (typeof maEv[loopObjTarg._maEvCo] !== 'undefined' && maEv[loopObjTarg._maEvCo]._acssStopImmedEvProp) {
				stopImEdProp = true;
				return false;
			}
		}
		delete imSt[thisStopCounter];
		delete _break['i' + thisStopCounter];
		_resetContinue(thisStopCounter);
		_resetExitTarget(thisStopCounter);
	}
};

const _performSecSel = (loopObj) => {
	let {chilsObj, secSelLoops, varScope, evObj } = loopObj;
	let compDoc = loopObj.compDoc || document;
	let loopRef = (!loopObj.loopRef) ? 0 : loopObj.loopRef;

	// In a scoped area, the variable area is always the component variable area itself so that variables used in the component are always available despite
	// where the target selector lives. So the variable scope is never the target scope. This is why this is not in _getSelector and shouldn't be.
	if (supportsShadow && compDoc instanceof ShadowRoot) {
		varScope = '_' + compDoc.host._acssActiveID.replace(/id\-/, '');
	} else if (!compDoc.isSameNode(document) && compDoc.hasAttribute('data-active-scoped')) {
		// This must be a scoped component.
		varScope = '_' + compDoc._acssActiveID.replace(/id\-/, '');
	} else {
		varScope = (evObj.varScope) ? evObj.varScope : null;
	}
	let inheritedScope = compDoc._acssInheritEvDoc;

	// This is currently used for the propagation state, but could be added to for anything else that comes up later.
	// It is empty at first and gets added to when referencing is needed.
	targetEventCounter++;
	taEv[targetEventCounter] = { };

	_performSecSelDo(chilsObj[secSelLoops], loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, 0);
};

const _performSecSelDo = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter) => {
	_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, 0);
	secSelCounter++;
	if (secSels[secSelCounter]) {
		let res = _performSecSelDo(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter);
	}
	if (secSelCounter == 1) {
		// Back to the top of the stack.
		// Remove this event from the mainEvent object. It shouldn't be done straight away as there may be stuff being drawn in sub-DOMs.
		// It just needs to happen at some point, so we'll say 10 seconds.
		setTimeout(function() { taEv = taEv.filter(function(_, i) { return i != targetEventCounter; }); }, 10000);
	}
};

const _performTarget = (outerTargetObj, targCounter) => {
	let { targ, obj, compDoc, evType, varScope, evScope, evObj, otherObj, origO, passCond, component, primSel, secSelEls, eve, inheritedScope, _maEvCo, _subEvCo, _imStCo, _taEvCo, loopRef, runButElNotThere, passTargSel, activeTrackObj, targetSelector, doc, chilsObj, origLoopObj, ifObj } = outerTargetObj;
	let act, outerFill, tmpSecondaryFunc, actionValue;

	if (!targ ||
			typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue') ||
			_checkExitTarget(_imStCo) ||
			outerTargetObj.allowMoreActions === false	// This variable gets set to true when an valid selector is found and allows the continuing of running action commands.
		) {
		return;
	}

	let m = Object.keys(targ)[targCounter];
	let targVal = targ[m].value;
	let targName = targ[m].name;

	let resultOfLoopCheck = _checkRunLoop(outerTargetObj, targVal, targName, m, 'action');
	if (!resultOfLoopCheck.atIf) {
		// Wipe previousIfRes, as this is no longer looking for an "@else if" or "@else".
		delete outerTargetObj.previousIfRes;

		// Generate the object that performs the magic in the functions.
		tmpSecondaryFunc = targName._ACSSConvFunc();

		actionValue = targVal;

		act = {
			event: evType,
			func: tmpSecondaryFunc,
			actName: targName,
			secSel: passTargSel,
			secSelEls: secSelEls,
			origSecSel: targetSelector,
			actVal: actionValue,
			origActVal: actionValue,
			primSel,
			rules: targ,
			obj,
			doc,
			ajaxObj: otherObj,
			e: eve,
			inheritedScope,
			_maEvCo,
			_subEvCo,
			_imStCo,
			_taEvCo,
			passCond: passCond,
			file: targ[m].file,
			line: targ[m].line,
			intID: targ[m].intID,
			activeID: activeTrackObj,
			varScope,	// unique counter of the shadow element rendered - used for variable scoping.
			evScope,
			evObj,
			origO,
			compDoc,
			component,
			loopRef,
			evDeclObj: chilsObj,
			ranAction: outerTargetObj.allowMoreActions,
			runPerm: runButElNotThere,
			origLoopObj,
			ifObj
		};

		outerTargetObj.allowMoreActions = _performAction(act, runButElNotThere);
	}

	targCounter++;
	if (targ[targCounter] && outerTargetObj.allowMoreActions !== false) {
		_performTarget(outerTargetObj, targCounter);
	}
};

const _performTargetOuter = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter) => {
	let {chilsObj, secSelLoops, obj, evType, evScope, evObj, otherObj, origO, sel, passCond, component, primSel, eve, _maEvCo, _subEvCo, _imStCo, runButElNotThere, origLoopObj } = loopObj;

	let targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', n;

	if (!secSels[secSelCounter]) return;
	targetSelector = Object.keys(secSels[secSelCounter])[outerTargCounter];

	// Loop target selectors in sequence.
	if (typeof taEv[targetEventCounter] !== 'undefined' && taEv[targetEventCounter]._acssStopImmedEvProp ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue')
		) {
		return;
	}
	if (targetSelector == 'conds') return;	// skip the conditions.

	let resultOfLoopCheck = _checkRunLoop(loopObj, secSels[secSelCounter][targetSelector], targetSelector, targetEventCounter);
	if (resultOfLoopCheck.atIf) {
		return;
	}

	let flowTargetSelector = targetSelector, parallelFlow;
	if (flowTargetSelector.endsWith(' parallel')) {
		parallelFlow = true;
		flowTargetSelector = flowTargetSelector.slice(0, -9).trim();
	}

	// Does the compDoc still exist? If not, if there is different scoped event root use that. Needed for privateEvents inheritance after component removal.
	if (inheritedScope && !compDoc.isConnected) {
		compDoc = inheritedScope;
	}

	// At this point we should have everything we need to run the event selector as the target selector.
	// However, if this is not the event selector, we need to process each target selector separately.
	// For example, we may be grabbing all the iframes in a document, but each target is in its own component.
	// We therefore have to get the component details of each target and pass these into the rest of the event flow.
	// We perform the selector parsing from the doc/compDoc location of the event selector.

	// First, establish if the target is the event selector. If so, there is no target selector to parse and we keep handling for it separate for speed.
	if (meMap.includes(flowTargetSelector)) {
		// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
		// It won't work unless we can identify it later and have it selectable as a string.
		if (primSel.indexOf('~') !== -1) {
			flowTargetSelector = primSel;
		} else if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
			if (obj == 'window') {
				flowTargetSelector = window;
			} else if (obj == 'body') {
				flowTargetSelector = document.body;
			} else {
				flowTargetSelector = obj;
			}
		} else {
			activeTrackObj = _getActiveID(obj);
			if (activeTrackObj) {
				flowTargetSelector = idMap[activeTrackObj];
			} else {
				// It might not be an element, so a data-activeid wasn't assigned.
				flowTargetSelector = obj;
			}
		}

		// Get the correct document/iframe/shadow for this target. Resolve the document level to be the root host/document.
		doc = compDoc;

		let outerTargetObj = {
			targ: secSels[secSelCounter][targetSelector],
			targetSelector,
			secSelEls: [ flowTargetSelector ],
			obj,
			compDoc,
			evType,
			varScope,
			evScope,
			evObj,
			otherObj,
			origO,
			passCond,
			component,
			primSel,
			eve,
			inheritedScope,
			_maEvCo,
			_subEvCo,
			_imStCo,
			_taEvCo: targetEventCounter,
			loopRef,
			runButElNotThere,
			passTargSel: flowTargetSelector,
			activeTrackObj,
			flowTargetSelector,
			doc,
			chilsObj,
			origLoopObj,
		};

		_performTarget(outerTargetObj, 0);
		_resetExitTarget(_imStCo);

	} else {

		// Handle variables that need to be evaluated before grabbing the targets.
		flowTargetSelector = _sortOutTargSelectorVars(flowTargetSelector, obj, varScope, otherObj);

		let res = _getSelector({ obj, component, primSel, origO, compDoc }, flowTargetSelector, true);
		if (!res.obj) return;
		doc = res.doc;

		passTargSel = flowTargetSelector;

		let outerTargetObj = {
			targ: secSels[secSelCounter][targetSelector],
			targetSelector,
			secSelEls: res.obj,
			obj,
			compDoc,
			evType,
			varScope,
			evScope,
			evObj,
			otherObj,
			origO,
			passCond,
			component,
			primSel,
			eve,
			inheritedScope,
			_maEvCo,
			_subEvCo,
			_imStCo,
			_taEvCo: targetEventCounter,
			loopRef,
			runButElNotThere,
			passTargSel,
			activeTrackObj,
			flowTargetSelector,
			chilsObj,
			doc,
			origLoopObj,
		};

		if (!parallelFlow && typeof passTargSel == 'string' && !['~', '|'].includes(passTargSel.substr(0, 1))) {
			// This is used for the default "vertical" event flow. (The other option is "parallel" and is setup in _performActionDo().)
			let els = res.obj;
			let elsTotal = els.length;
			let co = 0, secSelObj;

			// Default target selector event flow. Parallel event flow is handled in _performActionDo().
			// Loop this action command over each of the target selectors before going onto the next action command.
			els.forEach(secSelObj => {
				// Loop over each target selector object and handle all the action commands for each one.
				co++;
				outerTargetObj.passTargSel = secSelObj;
				outerTargetObj._elsTotal = elsTotal;
				outerTargetObj._elsCo = co;

				_performTarget(outerTargetObj, 0);
				_resetExitTarget(_imStCo);
			});

		} else {
			_performTarget(outerTargetObj, 0);
			_resetExitTarget(_imStCo);
		}
	}

	outerTargCounter++;
	if (secSels[secSelCounter][outerTargCounter]) {
		_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter);
	}
};


const _sortOutTargSelectorVars = (passTargSel, obj, varScope, otherObj) => {
	// passTargSel is the string of the target selector that now goes through some changes.
	passTargSel = ActiveCSS._sortOutFlowEscapeChars(passTargSel);
	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			str: passTargSel,
			obj,
			varScope
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			obj: null,
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	strObj = _handleVars([ 'attrs' ],
		{
			str: strObj.str,
			obj: otherObj,
			varScope
		},
		strObj.ref
	);
	return _resolveVars(strObj.str, strObj.ref);
};


/*
const _performTargetOuter = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter) => {
	let {chilsObj, secSelLoops, obj, evType, evScope, evObj, otherObj, origO, sel, passCond, component, primSel, eve, _maEvCo, _subEvCo, _imStCo, runButElNotThere, origLoopObj } = loopObj;

	let targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', n;

	if (!secSels[secSelCounter]) return;
	targetSelector = Object.keys(secSels[secSelCounter])[outerTargCounter];

	// Loop target selectors in sequence.
	if (typeof taEv[targetEventCounter] !== 'undefined' && taEv[targetEventCounter]._acssStopImmedEvProp ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue')
		) {
		return;
	}
	if (targetSelector == 'conds') return;	// skip the conditions.

	let resultOfLoopCheck = _checkRunLoop(loopObj, secSels[secSelCounter][targetSelector], targetSelector, targetEventCounter);
	if (resultOfLoopCheck.atIf) {
		return;
	}

	let flowTargetSelector = targetSelector, parallelFlow;
	if (flowTargetSelector.endsWith(' parallel')) {
		parallelFlow = true;
		flowTargetSelector = flowTargetSelector.slice(0, -9).trim();
	}

	// Does the compDoc still exist? If not, if there is different scoped event root use that. Needed for privateEvents inheritance after component removal.
	if (inheritedScope && !compDoc.isConnected) {
		compDoc = inheritedScope;
	}

	// At this point we should have everything we need to run the event selector as the target selector.
	// However, if this is not the event selector, we need to process each target selector separately.
	// For example, we may be grabbing all the iframes in a document, but each target is in its own component.
	// We therefore have to get the component details of each target and pass these into the rest of the event flow.
	// We perform the selector parsing from the doc/compDoc location of the event selector.

	// First, establish if the target is the event selector. If so, there is no target selector to parse.

	// Get the correct document/iframe/shadow for this target. Resolve the document level to be the root host/document.
	if (evType == 'disconnectedCallback' && meMap.includes(flowTargetSelector)) {
		// The element won't be there. Just run the event anyway.
		doc = compDoc;
		passTargSel = flowTargetSelector;
	} else {
		targs = _splitIframeEls(flowTargetSelector, { obj, component, primSel, origO, compDoc });
		if (!targs) return;	// invalid target.
		doc = targs[0];
		passTargSel = targs[1];
	}

	// passTargSel is the string of the target selector that now goes through some changes.
	passTargSel = ActiveCSS._sortOutFlowEscapeChars(passTargSel);
	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			str: passTargSel,
			obj,
			varScope
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			obj: null,
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	strObj = _handleVars([ 'attrs' ],
		{
			str: strObj.str,
			obj: otherObj,
			varScope
		},
		strObj.ref
	);
	passTargSel = _resolveVars(strObj.str, strObj.ref);

	// Handle functions being run on self.
	if (meMap.includes(passTargSel)) {
		// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
		// It won't work unless we can identify it later and have it selectable as a string.
		if (primSel.indexOf('~') !== -1) {
			passTargSel = primSel;
		} else if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
			passTargSel = obj;
		} else {
			activeTrackObj = _getActiveID(obj);
			if (activeTrackObj) {
				passTargSel = idMap[activeTrackObj];
			} else {
				// It might not be an element, so a data-activeid wasn't assigned.
				passTargSel = obj;
			}
		}
	} else if (passTargSel == 'host') {
		let rootNode = _getRootNode(obj);
		passTargSel = (rootNode._acssScoped) ? rootNode : rootNode.host;
	}

	let outerTargetObj = {
		targ: secSels[secSelCounter][targetSelector],
		targetSelector,
		obj,
		compDoc,
		evType,
		varScope,
		evScope,
		evObj,
		otherObj,
		origO,
		passCond,
		component,
		primSel,
		eve,
		inheritedScope,
		_maEvCo,
		_subEvCo,
		_imStCo,
		_taEvCo: targetEventCounter,
		loopRef,
		runButElNotThere,
		passTargSel,
		activeTrackObj,
		flowTargetSelector,
		doc,
		chilsObj,
		origLoopObj,
	};

	if (!parallelFlow && typeof passTargSel == 'string' && !['~', '|'].includes(passTargSel.substr(0, 1))) {
		// This is used for the default "vertical" event flow. (The other option is "parallel" and is setup in _performActionDo().)
		let els = _prepSelector(passTargSel, obj, doc);
		let elsTotal = els.length;
		let co = 0, secSelObj;

		// Default target selector event flow. Parallel event flow is handled in _performActionDo().
		// Loop this action command over each of the target selectors before going onto the next action command.
		els.forEach(secSelObj => {
			// Loop over each target selector object and handle all the action commands for each one.
			co++;
//			let cloneOuterTargetObj = outerTargetObj;
//			cloneOuterTargetObj.passTargSel = secSelObj;
//			cloneOuterTargetObj._elsTotal = elsTotal;
//			cloneOuterTargetObj._elsCo = co;

//			let cloneOuterTargetObj = outerTargetObj;
			outerTargetObj.passTargSel = secSelObj;
			outerTargetObj._elsTotal = elsTotal;
			outerTargetObj._elsCo = co;

			_performTarget(outerTargetObj, 0);
			_resetExitTarget(_imStCo);
		});

	} else {
		_performTarget(outerTargetObj, 0);
		_resetExitTarget(_imStCo);
	}

	outerTargCounter++;
	if (secSels[secSelCounter][outerTargCounter]) {
		_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter);
	}
};
*/

const _recursiveScopeCleanUp = nod => {
	let ID;
	nod.querySelectorAll('*').forEach(function (obj, index) {
		ID = obj._acssActiveID;
		if (ID) {
			_deleteIDVars(ID);
			_deleteScopeVars('_' + ID.substr(3));
		}
		if (supportsShadow && obj.shadowRoot) {
			_recursiveScopeCleanUp(obj.shadowRoot);
		}
	});
};

const _renderCompDoms = (o, compDoc=o.doc, childTree='', numTopNodesInRender=0, numTopElementsInRender=0) => {
	// Set up any shadow DOM and scoped components so far unrendered and remove these from the pending shadow DOM and scoped array that contains the HTML to draw.
	// Shadow DOM and scoped content strings are already fully composed with valid Active IDs at this point, they are just not drawn yet.
	// Search for any data-acss-component tags and handle.
	compDoc.querySelectorAll('data-acss-component').forEach(function (obj, index) {
		_renderCompDomsDo(o, obj, childTree, numTopNodesInRender, numTopElementsInRender);

		// Quick way to check if components and scoped variables are being cleaned up. Leave this here please.
		// At any time, only the existing scoped vars and shadows should be shown.
//		console.log('Current shadow DOMs', shadowDoms);
//		console.log('scopedData:', scopedData);
//		console.log('scopedProxy:', scopedProxy);
//		console.log('actualDoms:', actualDoms);
//		console.log('compParents:', compParents);
	});
};

const _renderCompDomsClean = varScope => {
	delete compPending[varScope];
	// Clean up any shadow DOMs no longer there. Mutation observer doesn't seem to work on shadow DOM nodes. Fix if this is not the case.
	let shadTmp, shadObj;
	for ([shadTmp, shadObj] of Object.entries(shadowDoms)) {
		if (!shadObj.isConnected) {
			// Delete any variables scoped to this shadow. This will also trigger the deletion of the shadow from the shadowDoms object in _varUpdateDom.
			delete scopedProxy[shadTmp];
		}
	}
};

const _renderCompDomsDo = (o, obj, childTree, numTopNodesInRender, numTopElementsInRender) => {
	let shadowParent, strictlyPrivateEvents, privateEvents, parentCompDetails, isShadow, shadRef, varScope, evScope, componentName, template, shadow,
		shadPar, shadEv, strictVars, privVars;

	shadowParent = obj.parentNode;
	parentCompDetails = _componentDetails(shadowParent);

	shadRef = obj.getAttribute('data-ref');
	// Determine if this is a shadow or a scoped component. We can tell if the mode is set or not.
	componentName = obj.getAttribute('data-name');
	strictlyPrivateEvents = components[componentName].strictPrivEvs;
	privateEvents = components[componentName].privEvs;
	isShadow = components[componentName].shadow;
	strictVars = components[componentName].strictVars;
	privVars = components[componentName].privVars;

	// We have a scenario for non-shadow DOM components:
	// Now that we have the parent node, is it a dedicated parent with no other children? We need to assign a very specific scope for event and variable scoping.
	// So check if it already has child nodes. If it does, then it cannot act as a host. Components must have dedicated hosts. So we will add one later.
	// Shadow DOM components already have hosts, so this action of assigning a host if there is not one does not apply to them.
	let scopeEl;

	// Handle a spread scope - ie. multiple top-level nodes, that have been requested to be event scoped. We need a surrogate host from which to
	// run querySelectorAll for the events.
	// Otherwise, for non-shadow DOM components, the first element will be the host.
	// This is a change to previous behaviour, where if there was a parent element with only one child, then that would act as the host.
	// But that doesn't work with something like an li, a td, or sibling elements which can have multiple siblings but still need event isolation.
	// The host should really be the first child of the component, but event query selections need to include that first child, which is where it starts to
	// get tricky. I'm not going to enforce a container div like other frameworks, as that is a workaround and won't allow td and lis and siblings as
	// separate components.
	// Storing separate scope references in the parent element won't work either, as the DOM can change, and scope references could change with regards
	// the parent.
	// A way to do this could be:
	// 1. Attach the scope to the first child and not the parent. This is a bit challenging in itself.
	// 2. Don't attach a scope at all if it doesn't need one. Currently scopes are being added for all components and it isn't necessary.
	// 2. Have "queryselectorall" and "matches" with the same selector for target selection and action command selection.
	// This is only for everything except event selectors,that already uses matches. It might be ok.
	// It could be done that way only for those components that need it so as not to affect performance everywhere.
	// This selection wrapping function could be expand to allow multiple top level nodes in a component, but I don't know how much performance will be
	// affected. It might possibly be ok, as the main event loop won't need changing.
	// For now, this is a work in progress and the events section in the components area of the docs now has the note regarding trs and li scoped components.
	// This would be great to get eventually resolved. Another option is to allow host parents to hold multiple inner scopes, and that possibly may be
	// simpler to implement, or it may not.
	if (!isShadow && (
			privateEvents ||
			strictlyPrivateEvents ||
			privVars
			) &&
			(numTopNodesInRender > 0 && numTopElementsInRender > 1 ||	// like "<div></div><div></div>"
			numTopNodesInRender > 1 && numTopElementsInRender > 0)		// like "kjh<div></div>"
		) {
		// We need the surrogate host for this, otherwise the events won't be isolated to spreading scope nature of the render.
		scopeEl = document.createElement('acss-scope');
		shadowParent.replaceChild(scopeEl, obj);
		// Switch the parent to the new scoping element.
		shadowParent = scopeEl;
	} else {
		obj.remove();	// Remove the shadow DOM reference tag.
	}

	if (isShadow && shadowParent.shadowRoot) {
		// This is an additional shadow render covering the same area, but we already have this covered.
		_renderCompDomsClean(shadRef);
		return;
	}

	varScope = _getActiveID(shadowParent).replace('id-', '_');
	// Set the variable scope up for this area. It is really important this doesn't get moved otherwise the first variable set in the scope will only initialise
	// the scope and not actually set up the variable, causing a hard-to-debug "variable not always getting set" scenario.
	if (scopedProxy[varScope] === undefined) {
		scopedProxy[varScope] = {};
	}

	evScope = varScope;		// This needs to be per component for finding event per component when looping.

	// Set up a private variable scope reference if it is one so we don't have to pass around this figure.
	// Note that the scope name, the varScope, is not the same as the component name. The varScope is the reference of the unique scope.
	privVarScopes[varScope] = privVars ? true: false;

	// Set up map per component of higher-level variable scopes to iterate when getting or setting vars. This is for non-"strictlyPrivateVars" components.
	// It should be only necessary to reference the fact that the current component has a sharing parent.
	// If there is no parent because this the document scope, then there is no parent.
	// If the parent is the document scope, there may be no o.varscope, so it is marked as "main" to show it is available.

	let varScopeToPassIn = (privVarScopes[varScope]) ? varScope : (o.varScope) ? o.varScope : null;
	o.varScope = varScopeToPassIn;

	// Get the parent component details for event bubbling (not element bubbling).
	// This behaviour is exactly the same for shadow DOMs and non-shadow DOM components.
	// The data will be assigned to the compParents array further down this page once we have the component drawn.
	compParents[evScope] = parentCompDetails;
	strictCompPrivEvs[evScope] = strictlyPrivateEvents;
	compPrivEvs[evScope] = privateEvents;

	let embeddedChildren = false;
	if (compPending[shadRef].indexOf('{$CHILDREN}') !== -1) {
		compPending[shadRef] =  _renderRefElements(compPending[shadRef], childTree, 'CHILDREN');
		embeddedChildren = true;
	}

	strictPrivVarScopes[evScope] = strictVars;

	// Store the component name in the element itself. We don't need to be able to select with it internally, so it is just a property so we don't clutter the
	// html more than we have to. It is used by the Elements extension for locating related events, which requires the component name, and we have the element at
	// that point so we don't need to search for it.
	shadowParent._acssComponent = componentName;
	shadowParent._acssVarScope = varScopeToPassIn;
	shadowParent._acssStrictPrivEvs = strictlyPrivateEvents;
	shadowParent._acssPrivEvs = privateEvents;
	shadowParent._acssStrictVars = strictVars;
	shadowParent._acssEvScope = evScope;

	// Run a beforeComponentOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeComponentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: undefined, component: componentName, _maEvCo: o._maEvCo });

	// Start mapping the variables - we're going to output them all at the same time to avoid progressive evaluation of variables within the substituted content itself.

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str: compPending[shadRef],
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: varScopeToPassIn,
			shadowParent: shadowParent
		}
	);
	strObj = _handleVars([ 'strings', 'html' ],
		{
			str: strObj.str,
			varScope: varScopeToPassIn,
		},
		strObj.ref
	);
	// Lastly, handle any {$STRING} value from ajax content if it exists.
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			o: o.ajaxObj,
			varScope: varScopeToPassIn,
		},
		strObj.ref
	);
	// Output the variables for real from the map.
	compPending[shadRef] = _resolveVars(strObj.str, strObj.ref);

	compPending[shadRef] = _replaceComponents(o, compPending[shadRef]);

	// Unescape any escaped curlies, like from $HTML_NOVARS or variables referenced within string variables now that rendering is occurring and iframe content is removed.
	compPending[shadRef] = _unEscNoVars(compPending[shadRef]);

	template = document.createElement('template');
	template.innerHTML = compPending[shadRef];

	// Remove the pending shadow DOM instruction from the array as it is about to be drawn, and some other clean-up.
	_renderCompDomsClean(shadRef);

	if (isShadow) {
		try {
			shadow = shadowParent.attachShadow({mode: components[componentName].mode});
			shadowObservers[evScope] = new MutationObserver(ActiveCSS._shadowNodeMutations);
			shadowObservers[evScope].observe(shadow, {
				attributes: true,
				characterData: true,
				childList: true,
				subtree: true
			});
		} catch(err) {
			_err('Error attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err, o);
		}
	} else {
		shadow = shadowParent;
		// All components need a scope, regardless of nature.
		shadow.setAttribute('data-active-scoped', '');
		shadow._acssScoped = true;
	}

	// Set the top level event scope which is used to search for target selectors in the correct scope.
	// If the component is within a private event scope then that is the scope unless it's further down inside a shadow DOM.
	// Otherwise it's in the inner shadow DOM scope or the document scope.
	if (isShadow) {
		// The shadow is the top level doc.
		shadowParent._acssTopEvDoc = shadow;
	} else if (privateEvents || strictlyPrivateEvents) {
		// The parent is the top level doc when running events inside the component.
		shadowParent._acssTopEvDoc = shadowParent;
	} else if (parentCompDetails.topEvDoc) {
		// Set the top level event scope for this component for quick reference.
		shadowParent._acssTopEvDoc = parentCompDetails.topEvDoc;
	} else {
		// The document is the top level doc.
		shadowParent._acssTopEvDoc = document;
	}
	// For private events, but only when running inherited events, the top level doc is parentCompDetails.topEvDoc.
	// I think there could be more to this - like the main focus should be on the target selector.
	if (privateEvents) {
		if (parentCompDetails.topEvDoc) {
			shadowParent._acssInheritEvDoc = parentCompDetails.topEvDoc;
		} else {
			shadowParent._acssInheritEvDoc = document;
		}
	}
	shadowDoms[varScope] = shadow;
	// Get the actual DOM, like document or shadow DOM root, that may not actually be shadow now that we have scoped components.
	actualDoms[varScope] = (isShadow) ? shadow : shadow.getRootNode();

	// Attach the shadow or the insides.
	shadow.appendChild(template.content);

	if (!embeddedChildren && childTree) {
		// Attach unreferenced children that need to be outside the shadow or the insides - basically it will go at the end of the container.
		shadowParent.insertAdjacentHTML('beforeend', childTree);
	}

	shadow.querySelectorAll('[data-activeid]').forEach(function(obj) {
		_replaceTempActiveID(obj);
	});

	let docToPass = (isShadow || strictlyPrivateEvents || privateEvents) ? shadow : o.doc;

	// Run a componentOpen custom event, and any other custom event after the shadow is attached with content. This is run on the host object.
	setTimeout(function() {
		// Remove the variable placeholders.
		_removeVarPlaceholders(shadow);

		_handleEvents({ obj: shadowParent, evType: 'componentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: docToPass, component: componentName, _maEvCo: o._maEvCo });

		shadow.querySelectorAll('*:not(template *)').forEach(function(obj) {
			if (obj.tagName == 'DATA-ACSS-COMPONENT') {
				// Handle any shadow DOMs now pending within this shadow DOM.
				_renderCompDomsDo(o, obj);
				return;
			}
			// Run draw events on all new elements in this shadow. This needs to occur after componentOpen.
			_handleEvents({ obj, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: varScopeToPassIn, evScope, compDoc: docToPass, component: componentName, _maEvCo: o._maEvCo });
		});

		if (isShadow) {
			// Iterate elements in this shadow DOM component and do any observe events.
			// Note this needs to be here, because the elements here that are not components have already been drawn and so the observe
			// event in the mutation section would otherwise not get run.
			_runInnerEvent(null, '*:not(template *)', 'observe', shadow, true);

			// Iterate custom selectors that use the observe event and run any of those that pass the conditionals.
			_handleObserveEvents(null, shadow, true);
		}
	}, 0);

	if (isShadow) {
		// Now add all possible window events to this shadow, so we can get some proper bubbling order going on when we handle events that don't have any real event
		// in the shadow. We have to do this - it's to do with future potential events being added during runtime and the necessity of being able to trap them in the
		// real target so we can initiate true bubbling.
		// Note that this looks "great - why don't we add it to the main set event stuff?" The reason being that we want to setup on only the events we use, and not all
		// events. We don't want to slow up the document unnecessarily. But we have to for shadow DOMs otherwise we never get a proper event target and we can't bubble.
		// We can't bubble because we bubble only on the target. We skip upper parent DOM events altogether, which are registered in the wrong order for bubbling, and
		// we can't manipulate the order of those because browsers do not allow a true clone of an event object and everything goes weird.
		// Basically, if you click on a sub-shadow DOM element and there is no event set on the DOM, it does not trigger IN the shadow DOM. The target is never reached.
		// So we make sure there is always going to be a shadow DOM event triggered by setting up all possible events. Technically overkill, but we have to do this.
		// It would be nice if there was a way to get the truly real target on any click, regardless of whether or not it is in a shadow DOM. But thankfully there is
		// e.composedPath(), otherwise we'd be royally buggered.
		let thisEv;
		if (allEvents.length == 0) {
			Object.keys(window).forEach(key => {
			    if (/^on/.test(key)) {
			    	thisEv = key.slice(2);
			    	allEvents.push(thisEv);
					_attachListener(shadow, thisEv, false, true);	// for speed.
			    }
			});
		} else {
			for (thisEv of allEvents) {
				_attachListener(shadow, thisEv, false, true);
			}
		}
		// Set up a separate change event for triggering an observe event on the native input event and for otherwise undetectable property changes.
		// Apologies in advance if this looks like a hack. If anyone has any better ideas to cover these scenarios, let me know.
		shadow.addEventListener('input', _handleShadowSpecialEvents);
		shadow.addEventListener('click', () => { setTimeout(_handleShadowSpecialEvents, 0); });
	}
};

const _renderIt = (o, content, childTree, selfTree) => {
	// All render functions end up here.
	// Convert the string into a node tree. Shadow DOMs and scoped components are handled later on. Every render command goes through here, even ones from render
	// events that get drawn in _renderCompDoms. It's potentially recursive. We need to handle the draw event for any non-shadow renders. Using a mutation observer
	// has proven to be over-wieldy due to the recursive nature of rendering events within and outside components, so we'll use a simple analysis to pin-point
	// which new elements have been drawn, and manually set off the draw event for each new element as they get drawn. This way we shouldn't get multiple draw
	// events on the same element.

	let isIframe, drawArr = [];
	isIframe = (o.secSelObj.tagName == 'IFRAME') ? true : false;
	// If true this is a direct render into an iframe. Iframe components can be rendered within a rendered string also with wrap-around iframe tags.
	// If it has been rendered within a component, the whole iframe and contents will be available in the content string.
	// Handle both scenarios here. There may be multiple iframes output in a single render embedded in the render string, so this need to work on
	// all of those. Probably best to render the content without the inner iframe stuff first, and then attach create the iframes after that.

	// run something that extracts the iframe content and returns a temporary array with iframe activeids and contents and a content string without the
	// iframe insides. Also if there is a src tag, rename that to something else and make sure it goes back after generating the iframe.
	// If isIframe is true, then instead create the temporary tag results and generate iframe here and skip the remainder of this script entirely.

	// don't forget to handle target selector insertion after this too.

	let iframes = [];
	if (content.indexOf('<iframe') !== -1) {
		// Prepare dynamic iframes for later rendering if it looks like they might be there.
		let contentObj = _sortOutDynamicIframes(content);
		content = contentObj.str;
		iframes = contentObj.iframes;
	}

	let container = document.createElement('div');

	// If the first element is a table inner element like a tr, things like tr and subsequent tds are going to disappear with this method.
	// All we have to do is change these to something else, and put them back afterwards. One method used here is a replace. Probably could be better.
	// It just needs to survive the insertion as innerHTML. Test case is /manual/each.html from docs site - "@each - array of objects".
	let trFix = false;
	if (TABLEREGEX.test(content)) {
		// Optimization idea: It may be quicker to just wrap the whole string in a table tag, with a tr if it's a td. Should then convert fine in theory.
		// Then just remove afterwards. Rather than this hacky workaround. Or maybe not - we would still need the active ID carried over, which would have to
		// be done lower down. The question is, is that handling faster than the current one? If so, do it, but it's not clear-cut at this point without doing it.
		trFix = true;
		content = content.replace(/\/tr>/gmi, '\/acssTrTag>').
			replace(/\/td>/gmi, '\/acssTdTag>').
			replace(/\/table>/gmi, '\/acssTableTag>').
			replace(/\/tbody>/gmi, '\/acssTbodyTag>').
			replace(/\/th>/gmi, '\/acssThTag>').
			replace(/<tr/gmi, '<acssTrTag').
			replace(/<td/gmi, '<acssTdTag').
			replace(/<table/gmi, '<acssTableTag').
			replace(/<tbody/gmi, '<acssTbodyTag').
			replace(/<th/gmi, '<acssThTag');
	}

	content = _escapeInnerQuotes(content);

	container.innerHTML = content;

	// Get the number of child elements and nodes. Remember that rendering doesn't have to include child elements.
	// This is used for core scope options later on in _renderCompDomsDo.
	let numTopElementsInRender = container.childElementCount;
	let numTopNodesInRender = container.childNodes.length;

	let cid;
	// Make a list of all immediate children via a reference to their Active IDs. After rendering we then iterate the list and run the draw event.
	// We do this to make sure we only run the draw events on the new items.
	// There are positions - it isn't always a straight inner render. And there can be more than one immediate child element.
	container.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);	// Assign the active ID in a temporary state.
		drawArr.push(cid);
	});

	// We need this - there are active IDs in place from the _getActiveID action above, and we need these to set off the correct draw events.
	content = container.innerHTML;

	// Put any trs and tds back.
	if (trFix) {
		content = content.replace(/acssTrTag/gmi, 'tr').
			replace(/acssTdTag/gmi, 'td').
			replace(/acssTableTag/gmi, 'table').
			replace(/acssTbodyTag/gmi, 'tbody').
			replace(/acssThTag/gmi, 'th');
	}

	// We only do this next one from the document scope and only once.
	if (!o.component) {
		// First remove any tags that are about to be removed. This MUST happen before the addition - don't put it into node mutation.
		let configRemovalCheck = true;
		if (o.renderPos && !isIframe) {
			if (o.renderPos == 'replace') {
				// Check everything from o.secSelObj down. Here, just check the o.secSelObj and check the rest below.
				if (_isACSSStyleTag(o.secSelObj)) {
					_regenConfig(o.secSelObj, 'remove');
				}
			} else {
				// No need to do anything - content isn't being replaced.
				configRemovalCheck = false;
			}
		}
		if (configRemovalCheck) {
			// Check everything below o.secSelObj down.
			o.secSelObj.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
				_regenConfig(obj, 'remove');
			});
		}

		// Now it is safe to add new config.
		content = _addInlinePriorToRender(content);
	}

	// Handle any reference to {$CHILDREN} that need to be dealt with with these child elements before any components get rendered.
	if (childTree != '') content = _renderRefElements(content, childTree, 'CHILDREN');

	// Handle any reference to {$SELF} that needs to be dealt with before any components get rendered.
	if (selfTree != '') content = _renderRefElements(content, selfTree, 'SELF');

	// Unescape any escaped curlies, like from $HTML_NOVARS or variables referenced within string variables now that rendering is occurring and iframe content is removed.
	content = _unEscNoVars(content);

	if (o.renderPos && !isIframe) {
		if (o.renderPos == 'replace') {
			o.secSelObj.insertAdjacentHTML('beforebegin', content);	// Can't replace a node with potentially multiple nodes.
			o.secSelObj.remove();
		} else {
			o.secSelObj.insertAdjacentHTML(o.renderPos, content);
		}
	} else {
		o.secSelObj.innerHTML = content;
	}

	// Create any iframes that are needed from the temporary iframe array.
	if (iframes.length > 0) {
		_resolveDynamicIframes(iframes, o);
	}

	if (isIframe) return;

	if (drawArr.length == 0) {
		// What was rendered was the inner contents of an element only, so we need to remove var placeholders on the node itself.
		// May as well use the parent of the target selector to ensure we got it. This could be tweaked to be more exact.
		_removeVarPlaceholders(o.secSelObj.parentNode);
	}

	let item, el;
	for (item of drawArr) {
		el = o.doc.querySelector('[data-activeid=' + item + ']');
		if (!el) continue;

		if (el.tagName != 'IFRAME') {
			_removeVarPlaceholders(el);
			_replaceTempActiveID(el);
		}
		el.querySelectorAll('[data-activeid]').forEach(function(obj) {	// jshint ignore:line
			if (obj.tagName == 'IFRAME') return;
			_replaceTempActiveID(obj);
		});

		if (!el || el.shadow || el.scoped || el.tagName == 'IFRAME') continue;		// We can skip tags that already have shadow or scoped components.

		_handleEvents({ obj: el, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });

		el.querySelectorAll('*:not(template *)').forEach(function(obj) {	// jshint ignore:line
			// We can potentially have the same element running a draw event twice. Like the first draw event can add content inside any divs in the first object, which
			// could run this script again. When it finishes that run, it would then come back and run the loop below. And thereby running the draw event twice.
			// So we mark the element as drawn and don't run it twice. It gets marked as drawn in _handleEvents.
			if (obj._acssDrawn || ['DATA-ACSS-COMPONENT', 'IFRAME'].indexOf(obj.tagName) !== -1) return;		// Skip pending data-acss-component tags. Note that node may have changed.
			_handleEvents({ obj: obj, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		});
	}

	_renderCompDoms(o, undefined, childTree, numTopNodesInRender, numTopElementsInRender);
};

const _renderRefElements = (str, htmlStr, refType) => {
	// Replace any reference to {$CHILDREN} or {$SELF} with the child nodes of the custom element.
	if (str.indexOf('{$' + refType + '}') !== -1) {
		// This needs to not count escaped references to this variable.
		let regex = (refType == 'CHILDREN') ? CHILDRENREGEX : SELFREGEX;
		str = str.replace(regex, htmlStr);
	}
	return str;
};

const _replaceEventVars = (sel, obj) => {
	let str = ActiveCSS._sortOutFlowEscapeChars(sel);
	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			str,
			obj
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			str: strObj.str,
		},
		strObj.ref
	);
	return _resolveVars(strObj.str, strObj.ref);
};

const _replaceHTMLVars = (o, str, varReplacementRef=-1) => {
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-\:]+)\}/gi, function(_, c) {
		let doc, noVars, escaped, unEscaped;
		let noVarsPos = c.indexOf(':NOVARS');
		if (noVarsPos !== -1) {
			noVars = true;
			c = c.replace(/\:NOVARS/, '');
		}
		let escapedPos = c.indexOf(':ESCAPED');
		if (escapedPos !== -1) {
			escaped = true;
			c = c.replace(/\:ESCAPED/, '');
		}
		let unEscapedPos = c.indexOf(':UNESCAPED');
		if (unEscapedPos !== -1) {
			unEscaped = true;
			c = c.replace(/\:UNESCAPED/, '');
		}
		if (c.startsWith('document:')) {
			c = c.substr(9);
			doc = document;
		} else {
			doc = _resolveDocObj(o.doc);
		}
		let el = doc.getElementById(c);
		if (el) {
			let res;
			switch (el.tagName) {
				case 'INPUT':
				case 'TEXTAREA':
					res = el.value;
					break;

				default:
					res = el.innerHTML;
			}
			if (noVars) res = _escNoVars(res);
			if (escaped) res = _safeTags(res);
			if (unEscaped) res = _unSafeTags(res);
			let newRes = _preReplaceVar(res, varReplacementRef);

			return newRes;
		}
		// Return it as it is if the element is not there.
		return '{#' + c + '}';
	});
	return str;
};

const _replaceIframeEsc = str => {
	return str.replace(/_ACSS_lt/gm, '<').replace(/_ACSS_gt/gm, '>');
};

const _resolveDocObj = (doc) => {
	return (doc.nodeType !== Node.DOCUMENT_NODE) ? doc.getRootNode() : doc;
};

const _resolveDynamicIframes = (iframes, o) => {
	o.doc.querySelectorAll('data-acss-iframe').forEach(function(obj) {	// jshint ignore:line
		_resolveDynamicIframesDo(obj, iframes);
	});
};

const _resolveDynamicIframesDo = (el, iframes) => {
	// Get temporary non-DOM container.
	let tmpDiv = document.createElement('div');

	// Create base iframe. This gives the original defined iframe without the content
	let ref = el.getAttribute('data-ref');
	tmpDiv.innerHTML = _unEscNoVars(iframes[ref].mainTag);
	let iframe = tmpDiv.firstChild;

	iframes[ref].innards = _unEscNoVars(iframes[ref].innards);

	// Attach content to srcdoc.
	iframe.srcdoc = iframes[ref].innards;

	// Replace placeholder with completed iframe.
	el.parentNode.replaceChild(iframe, el);
};

const _runInnerEvent = (o, sel, ev, doc=document, initialization=false) => {
	let noDrawTwiceCheck = (ev == 'draw' && initialization);	// If new elements get added during body:init, then it's possible draw events can happen on the same thing twice, hence this line.
	o = o || {};
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			if (!obj._acssDrawn || !noDrawTwiceCheck) _handleEvents({ obj: obj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		});
	} else {
		// This is a draw trigger on an element, which should include its contents.
		_handleEvents({ obj: o.secSelObj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		_runInnerEvent(o, '*:not(template *)', ev, o.secSelObj);
	}
};

const _setUpForObserve = (useForObserveID, useForObservePrim, condClause) => {
	if (elObserveTrack[useForObserveID] === undefined) elObserveTrack[useForObserveID] = [];
	if (elObserveTrack[useForObserveID][useForObservePrim] === undefined) elObserveTrack[useForObserveID][useForObservePrim] = {};
	if (elObserveTrack[useForObserveID][useForObservePrim][condClause] === undefined) elObserveTrack[useForObserveID][useForObservePrim][condClause] = {};
};

const _setUpNavAttrs = (el) => {
	let hrf = el.getAttribute('href');
	if (hrf) {
		let pageItem = _getPageFromList(hrf);
		if (pageItem) {
			let tmpDiv = document.createElement('div');
			tmpDiv.insertAdjacentHTML('beforeend', '<a href="' + pageItem.url + '" ' + pageItem.attrs + '>');
			_cloneAttrs(el, tmpDiv.firstChild);
		}
	}
};

ActiveCSS._shadowNodeMutations = mutations => ActiveCSS._nodeMutations(mutations, null, mutations[0].target.getRootNode(), true);	// true = insideShadowDOM

const _sortOutDynamicIframes = str => {
	// We want only outer iframes, and we want the inner contents that could contain iframes placed into a placeholder.
	// There can be more than one outer iframe, and also surrounding text bits scattered about around the iframes.
	// This routine sorts all that out. It should ignore standard iframe format (minus the scenario where iframes are not supported which this doesn't
	// currently handle).

	str = str.replace(/\r|\n/gm, '').replace(/\t/gm, ' ');

	// First of all, escape any opening and closing tags in quotes. We need the check the real tags only.
	str = str.replace(/"((?:\\.|[^"\\])*)"/gm, function(_, innards) {
		innards = innards.replace(/</gm, '_ACSS_lt').replace(/>/gm, '_ACSS_gt');
		return '"' + innards + '"';
	});

	let iframes = [], ref = 0, arr = str.split('<iframe'), endPos, concatStr = '', i = 0, arrLen = arr.length, mainTag, innards, innerCount = 0,
		accumInnards = '', outerTag = '', useOuterTag, closingChar, closingArr, closingArrLen, cl, openingChar;

	let foundContentInIframe = false;
	for (i; i < arrLen; i++) {
		if (arr[i].trim() == '') continue;
		endPos = arr[i].indexOf('</iframe>');

		if (innerCount == 0 && endPos !== -1) {
			if (i == 0) {
				concatStr += arr[0].substr(0, endPos);
			}
			// We're on the top level and we've found the correct outer closing tag
			closingChar = arr[i].indexOf('>');
			if (arr[i].substr(closingChar + 1, endPos - closingChar - 1).trim() == '') continue;	// This is an iframe with no content. Ignore completely.
			foundContentInIframe = true;
			concatStr += '<data-acss-iframe data-ref="' + ref + '"></data-acss-iframe>';
			if (outerTag != '') {
				useOuterTag = outerTag;
			} else {
				useOuterTag = arr[i].substr(0, closingChar + 1);
			}
			mainTag = '<iframe ' + useOuterTag;
			innards = accumInnards + arr[i].substr(closingChar + 1, endPos - closingChar - 1);
			useOuterTag = '';
			concatStr += arr[i].substr(endPos + 10);
			iframes[ref] = { mainTag: _replaceIframeEsc(mainTag), innards: _replaceIframeEsc(innards) };
			accumInnards = '';
			ref++;
		} else if (endPos !== -1) {
			// Found a closing tag. Is there only one?
			accumInnards += '<iframe ';
			closingArr = arr[i].split('</iframe>');
			closingArrLen = closingArr.length;
			cl = 0;
			for (cl; cl < closingArrLen; cl++) {
				if (closingArr[cl].trim() == '') {
					accumInnards += '</iframe>';
					continue;
				}
				if (innerCount == 0) {
					// We're now on the top level and we've found the correct outer closing tag
					closingChar = closingArr[cl].indexOf('>');
					openingChar = closingArr[cl].indexOf('<');
					if (arr[i].substr(closingChar + 1, endPos - closingChar - 1).trim() == '') continue;	// This is an iframe with no content. Ignore completely.
					foundContentInIframe = true;
					concatStr += '<data-acss-iframe data-ref="' + ref + '"></data-acss-iframe>';
					mainTag = '<iframe ' + outerTag;
					outerTag = '';
					if (openingChar < closingChar) {
						innards = accumInnards + closingArr[cl];
					} else {
						innards = accumInnards + closingArr[cl].substr(closingChar + 1);
					}
					iframes[ref] = { mainTag: _replaceIframeEsc(mainTag), innards: _replaceIframeEsc(innards) };
					accumInnards = '';
					ref++;
				} else {
					accumInnards += closingArr[cl];
					if (cl < closingArrLen - 1) {
						accumInnards += '</iframe>';
					}
				}
				innerCount--;
			}
			// Concat anything left after the last iframe. Put in test code for this.
			concatStr += accumInnards;
			accumInnards = '';
		} else {
			if (innerCount == 0 && i == 0) {
				concatStr += arr[0];
			} else {
				// There's another iframe inside so we just ignore it and wait to add it to a map when innerCount gets back to 0.
				closingChar = arr[i].indexOf('>');
				outerTag = arr[i].substr(0, closingChar + 1);
				accumInnards += arr[i].substr(closingChar + 1);
				innerCount++;
			}
		}
	}
	str = (foundContentInIframe) ? concatStr: str;

	// Put tag chars back.
	str = _replaceIframeEsc(str);

	return { str, iframes };
};

const _trigHashState = (e) => {
	// Either there isn't anything to run yet or it's not ready to run now.
	if (hashEventAjaxDelay || !hashEventTrigger) return;

	hashEventTrigger = false;

	let n, el, eventsLen = hashEvents.length, runEvents = [], thisHashRef, thisHashEvent;
	for (n = 0; n < eventsLen; n++) {
		thisHashRef = _getPageFromList('#' + hashEvents[n]);
		if (thisHashRef) {
			thisHashEvent = thisHashRef.attrs;

			let str = thisHashEvent.substr(thisHashEvent.indexOf('=') + 1).trim()._ACSSRepQuo();
			let lastPos = str.lastIndexOf(':');
			let sel = str.substr(0, lastPos).trim();
			let ev = str.substr(lastPos + 1).trim();

			// Put all these details into an array to iterate in one bash.
			// This should avoid any subsequent race conditions when hitting the event triggers as potentially anything could happen.
			runEvents.push({ sel, ev });
		}
	}

	// Wipe any outstanding global hash events.
	hashEvents = [];

	// Iterate the stored triggers. The runEvents array is locally immutable here so won't be affected by actions happening during any triggers.
	let runEventsLen = runEvents.length;
	for (n = 0; n < runEventsLen; n++) {
		// Currently this will only work if the hash trigger is in the document scope.
		// This could be upgraded later but is a little involved due to component uniqueness.
		el = document.querySelector(runEvents[n].sel);
		if (el && runEvents[n].ev != '') {
			ActiveCSS.trigger(el, runEvents[n].ev, null, document, null, null, e);
		} else {
			// Try it at the end of the stack as it could be waiting for something to render.
			let trySel = runEvents[n];
			setTimeout(function() {		// jshint ignore:line
				el = document.querySelector(trySel.sel);
				ActiveCSS.trigger(el, trySel.ev, null, document, null, null, e);
			}, 0);
		}
	}
};

const _checkBreakLoop = (_imStCo, innerType) => {
	let breakOutOfContinue = (innerType == 'inner') ? false : true;
	if (typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break', true) ||
			_decrBreakContinue(_imStCo, 'continue', breakOutOfContinue) ||
			_checkExitTarget(_imStCo)
		) {
		return true;
	}
	return false;
};

const _checkExitTarget = _imStCo => {
	return (typeof exitTarget['i' + _imStCo] !== 'undefined' && exitTarget['i' + _imStCo] === true);
};

const _checkRunLoop = (outerTargetObj, chils, statement, pointer, loopWhat) => {
	if (!chils) return { atIf: false };
	let atIfDetails = _getLoopCommand(statement);
	if (atIfDetails !== false) {
		let outerTargetObjClone = _clone(outerTargetObj);
		let chilsClone = _clone(chils);
		let innerLoopObj = {
			...outerTargetObjClone,		// jshint ignore:line
		};
		let outerFill = [];
		outerFill.push(chilsClone);
		innerLoopObj.chilsObj = outerFill;
		innerLoopObj.fullStatement = statement;
		innerLoopObj.atIfDetails = atIfDetails;
		innerLoopObj.loopWhat = loopWhat;
		if (loopWhat == 'action') {
			innerLoopObj.targPointer = pointer;
		} else {
			innerLoopObj.secSelLoops = '0';
			innerLoopObj._taEvCo = pointer;
		}
		_handleLoop(innerLoopObj);
		if (innerLoopObj.ifRes && innerLoopObj.ifRes.res === true) outerTargetObj.previousIfRes = innerLoopObj.ifRes;
		return { atIf: true };
	} else {
		delete outerTargetObj.previousIfRes;
	}
	return { atIf: false };
};

const _decrBreakContinue = (_imStCo, typ, decrement=false) => {
	// Break/Continue: returns false if nothing to break, true if there is a current thing to break out of.
	// Both handlings break out of the action command flow until it rehits the loop iteration.
	// The main difference is that for continue the loop continues if the continue number reaches zero, whereas for break it breaks out of the loop at zero.
	// This function sets up the handlings. The handlings themselves happen at various points in the event flow.
	// Variable clean-up occurs in _performEvent().
	let pointer = 'i' + _imStCo;
	let checkVar = (typ == 'break') ? _break[pointer] : _continue[pointer];
	if (!checkVar || checkVar == 0) return false;
	if (decrement) {
		if (typ == 'break') {
			_break[pointer]--;
		} else {
			// Only return true if we need to break out of this continue and go to the next outer loop;
			_continue[pointer]--;
			if (_continue[pointer] < 1) return false;
		}
	}
	return true;
};

const _getLoopCommand = str => {
	if (str.startsWith('@else if ')) {
		return { name: '@else if', type: 'notloop' };
	} else if (str.startsWith('@else media ')) {
		return { name: '@else media', type: 'notloop' };
	} else if (str.startsWith('@else support ')) {
		return { name: '@else support', type: 'notloop' };
	} else {
		let pos = str.indexOf(' ');
		let wot = (pos !== -1) ? str.substr(0, pos) : str;
		if (wot && STATEMENTS.indexOf(wot) !== -1) {
			return { name: wot.trim(), type: ((wot == '@each' || wot == '@for') ? 'loop' : 'notloop') };
		} else {
			return false;
		}
	}
};


const _handleLoop = (loopObj) => {
	let { fullStatement, varScope, atIfDetails, _imStCo } = loopObj;

	// Sort out the scope here as it doesn't need doing multiple times from inside the loop (if it is a loop).
	let scopePrefix = ((varScope && privVarScopes[varScope]) ? varScope : 'main') + '.';

	let statement = atIfDetails.name; 

	if (statement) {
		switch (statement) {
			case '@else':
			case '@else if':
				// If we've already run a successful if type statement, then don't run any more.
				if (loopObj.previousIfRes && loopObj.previousIfRes.res === true) return;		// jshint ignore:line
				// If it gets this far, continue with checking and running the if clause.

			case '@if':
				loopObj.ifRes = _handleIf(loopObj, statement);
				break;

			case '@else media':
			case '@else support':
				// If we've already run a successful if type statement, then don't run any more.
				if (loopObj.previousIfRes && loopObj.previousIfRes.res === true) return;		// jshint ignore:line
				// If it gets this far, continue with checking and running the if clause.

			case '@media':
			case '@support':
				// Media and support work like an @if statement, ie. they can work with @else if and @else. So treat like an @if after evaluation.
				loopObj.ifRes = _handleCSSAtStatement(loopObj, statement);
				break;

			case '@each':
				_resetContinue(_imStCo);
				_handleEach(loopObj, scopePrefix);
				break;

			case '@for':
				_resetContinue(_imStCo);
				_handleFor(loopObj, scopePrefix);
				break;

			case '@while':
				_handleWhile(loopObj);
				break;
		}
	}
};

const _resetContinue = _imStCo => {
	delete _continue['i' + _imStCo];
};

const _resetExitTarget = _imStCo => {
	delete exitTarget['i' + _imStCo];
};

const _runSecSelOrAction = obj => {
	if (obj.loopWhat == 'action') {
		let objCopy = _clone(obj);
		objCopy.targ = objCopy.targ[objCopy.targPointer].value;
		_performTarget(objCopy, 0);
	} else {
		_performSecSel(obj);
		_resetExitTarget(obj._imStCo);
	}
};

const _handleCSSAtStatement = (loopObj, ifType) => {
	let { fullStatement, loopWhat, varScope, passTargSel, primSel, evType, obj, otherObj, eve, doc, component, compDoc } = loopObj;

	// @media works like an @if statement, so it can work with @else if and @else. Hence it is treated here like an @if statement after evaluation.

	// First, remove @media/@support clause.
	let statement = fullStatement;
	statement = statement.substr(ifType.length).trim();

	let thisIfObj = {
		evType,
		varScope,
		otherObj,
		sel: primSel,
		eve,
		doc,
		component,
		compDoc,
	};

	if (loopWhat != 'action' || typeof passTargSel == 'string') {
		// This is surrounding a target selector, so the reference object is the event receiver object.
		thisIfObj.obj = obj;
	} else if (typeof passTargSel == 'object') {
		thisIfObj.obj = passTargSel;
	}

	let res = (ifType.indexOf('media') !== -1) ? _checkMedia(statement) : _checkSupport(statement);
	if (res) {
		// This is ok - run the inner contents.
		_runSecSelOrAction(loopObj);
	}

	return { ifType: '@if', res };
};

const _handleEach = (loopObj, scopePrefix) => {
	let { fullStatement, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @each name in {person}
	// eg. @each name, age in {person}
	// etc.
	let inPos = fullStatement.indexOf(' in ');
	let leftVar = fullStatement.substr(6, inPos - 6);
	let leftVars;
	if (leftVar.indexOf(',') !== -1) {
		// There is more than one left-hand assignment.
		leftVars = leftVar.split(',');
	}

	let rightVar = fullStatement.substr(inPos + 4);

	let prepExpr = _prepareDetachedExpr(rightVar, varScope);
	let rightVarVal = _evalDetachedExpr(prepExpr, varScope);

	if (!rightVarVal) {
		_warn('Error in evaluating' + rightVar + ' in @each - skipping loop.');
		return;
	}

	let itemsObj = {
		loopObj,
		existingLoopRef,
		leftVar,
		leftVars,
		rightVar,
		varScope,
		scopePrefix
	};

	if (_isArray(rightVarVal)) {
		if (rightVarVal.length > 0) _handleEachArrayOuter(rightVarVal, itemsObj, 0);
	} else {
		let items = Object.entries(rightVarVal);
		if (items.length > 0) _handleEachObj(items, itemsObj, 0);
	}
};

const _handleEachArrayInner = (rightVarVal, itemsObj, counter2) => {
	let { loopObj, leftVars, scopePrefix, counter } = itemsObj;
	let _imStCo = loopObj._imStCo;

	if (!itemsObj.leftVars[counter2] || _checkBreakLoop(_imStCo, 'inner')) return;

	let scopedVar = scopePrefix + leftVars[counter2].trim();
	_set(scopedProxy, scopedVar, rightVarVal[counter][counter2]);

	counter2++;
	if (itemsObj.leftVars[counter2]) {
		_handleEachArrayInner(rightVarVal, itemsObj, counter2);
	}
};

const _handleEachArrayOuter = (rightVarVal, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar, scopePrefix } = itemsObj, loopObj2, newRef;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo)) return;

	// Get the rightVar for real and loop over it.
	// Make a copy of loopObj. We're going to want original copies every time we substitute in what we want.
	loopObj2 = _clone(loopObj);

	if (!leftVars) {
		// Single level array, or a two-dimensional array with only one left-hand variable.
 		let scopedVar = scopePrefix + leftVar;
		_set(scopedProxy, scopedVar, rightVarVal[counter]);

		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_' + counter;
	} else {
		// Two dimensional array.
		itemsObj.counter = counter;
		_handleEachArrayInner(rightVarVal, itemsObj, 0, leftVars);
		loopObj2.loopRef = itemsObj.existingLoopRef + leftVars[0] + '_' + counter;
	}

	_runSecSelOrAction(loopObj2);

	counter++;
	if (rightVarVal[counter]) {
		_handleEachArrayOuter(rightVarVal, itemsObj, counter);
	} else {
		_resetContinue(_imStCo);
	}
};

const _handleEachObj = (items, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar, scopePrefix } = itemsObj, objValVar, loopObj2, newRef;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo)) return;

	let key = items[counter][0];
	let val = items[counter][1];

	loopObj2 = _clone(loopObj);

	if (!leftVars) {
		// Only referencing the key in the key, value pair.
		// Add this as a regular scoped variable.
		let scopedVar = scopePrefix + leftVar;
		_set(scopedProxy, scopedVar, key);
		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_0_' + counter;

	} else {
		// Add these as regular scoped variables.
		let scopedVarKey = scopePrefix + leftVars[0];
		_set(scopedProxy, scopedVarKey, key);
		loopObj2.loopRef = leftVars[0] + '_0_' + counter;

		let LeftVarValTrim = leftVars[1].trim();
		let scopedVarVal = scopePrefix + LeftVarValTrim;
		_set(scopedProxy, scopedVarVal, val);
		loopObj2.loopRef = itemsObj.existingLoopRef + LeftVarValTrim + '__lVEach' + counter;
	}

	_runSecSelOrAction(loopObj2);

	counter++;
	if (items[counter]) {
		_handleEachObj(items, itemsObj, counter);
	} else {
		_resetContinue(_imStCo);
	}
};

const _handleFor = (loopObj, scopePrefix) => {
	let { fullStatement, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @for n from 1 to 10 (defaults to increment of 1)
	// eg. @for n from 1 to 10 step 2
	// eg. @for n from 10 to 1 step -1
	// eg. @for n from 10 to -10 step -1
	// eg. @for n from -10 to 0 step 1
	// eg. @for n from 1 to 10 step 0.5
	// eg. @for n from {numVar} to {numVar2} step {numVar3}
	// etc.
	// It works with up to 5 decimal places. Not recommended for use with more than several thousand iterations for performance reasons.

	// Get the positions of the "from", "to" and "step" parts of the string.
	let statement = fullStatement;
	let fromPos = statement.indexOf(' from ');
	let toPos = statement.indexOf(' to ');
	let stepPos = statement.indexOf(' step ');

	if (fromPos === -1 || toPos === -1) {
		_err('"from" and "to" must be used in the @for statement, ' + statement);
	}

	// Extract each part of the string that we need to run the statement and assign to appropriate variables.
	let counterVar = statement.substr(5, fromPos - 5).trim();
	let fromVar = statement.substr(fromPos + 6, toPos - fromPos - 6);
	let toVar, stepVar;

	if (stepPos === -1) {
		toVar = statement.substr(toPos + 4);
		stepVar = '1';	// Defaults to 1 when it is not used in the statement.
	} else {
		toVar = statement.substr(toPos + 4, stepPos - toPos - 4);
		stepVar = statement.substr(stepPos + 6);
	}

	// Convert these reference strings to a number for use in the loop.
	let stepVal = _loopVarToNumber(stepVar, varScope);
	let fromVal = _loopVarToNumber(fromVar, varScope);
	let toVal = _loopVarToNumber(toVar, varScope);

	let stepValDP = _countPlaces(stepVal);	// The number of stepVal decimal places used - needed to solve JavaScript "quirk" when using basic decimal arithmetic.

	// Handle any errors from the conversion. We must have numbers, and the "step" value must not equal zero.
	if ([ fromVal, toVal, stepVal ].indexOf(false) !== -1) {
		_err('Could not establish valid values from @for statement, ' + statement, null, 'From:', fromVal, 'To:', toVal, 'Step:', stepVal);
	} else if (stepValDP > 5) {
		_err('@for statement can only handle up to 5 decimal places, ' + statement);
	}

	// If either "step" is set to zero, or there is a negative progression with no negative "step" value, skip loop.
	if (stepVal == 0 || fromVal > toVal && stepVal > 0) return;

	// Now that the loop is set up, pass over the necessary variables into the recursive for function.
	let itemsObj = {
		loopObj,
		existingLoopRef,
		counterVar,
		toVal,
		stepVal,
		stepValDP,
		scopePrefix
	};
	
	_handleForItem(itemsObj, fromVal);
};

const _handleForItem = (itemsObj, counterVal) => {
	let { loopObj, counterVar, toVal, stepVal, stepValDP, scopePrefix } = itemsObj, loopObj2, newRef, objValVar;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo)) {
		return;
	}

	loopObj2 = _clone(loopObj);

	let scopedVar = scopePrefix + counterVar;
	_set(scopedProxy, scopedVar, counterVal);
	loopObj2.loopRef = itemsObj.existingLoopRef + counterVar + '_0_' + counterVal;

	_runSecSelOrAction(loopObj2);

	// Increment the counter value by the iteration (step) value. Need to do a bit of jiggery pokery to handle JavaScript weird decimal arithmetic skills.
	if (stepValDP == 0) {
		counterVal += stepVal;
	} else {
		let stepValDPTimes10 = Math.pow(10, stepValDP) || 1;
		counterVal = (Math.round(counterVal * stepValDPTimes10) + Math.round(stepVal * stepValDPTimes10)) / stepValDPTimes10;
	}

	// Run this function again if we are still in the loop, bearing in mind that the "step" stepping value can be positive or negative.
	if (stepVal > 0 && counterVal <= toVal || stepVal < 0 && counterVal >= toVal) {
		_handleForItem(itemsObj, counterVal);
	} else {
		_resetContinue(_imStCo);
	}
};

const _loopVarToNumber = (str, varScope) => {
	// This takes a string and either converts it straight to a number, or if it is a variable then it converts it to that value, which should be
	// a number. If it doesn't convert specifically to a number, the function returns false.
	str = str.trim();

	// See if it converts to number first, before checking if it is a variable.
	let newVal = _getNumber(str);
	if (newVal !== false) return newVal;	// If it's a number by this point, then no further checks are necessary and we return the number.

	// Handle as an expression, potentially containing scoped variables.
	let prepExpr = _prepareDetachedExpr(str, varScope);
	let expr = _evalDetachedExpr(prepExpr, varScope);

	// Return the number or false if that value doesn't equate to a number.
	return _getNumber(expr);
};

const _checkAtIfOk = oObj => {
	let ifRes = _handleLoop(oObj);
	// Returns true if it isn't an @if statement, or the boolean result of the @if statement.
	return (typeof ifRes === 'object') ? (ifRes.command == '@if' && ifRes.res) : true;
};

const _handleIf = (loopObj, ifType) => {
	let { fullStatement, loopWhat, varScope, passTargSel, primSel, evType, obj, secSelObj, otherObj, eve, doc, component, compDoc, ifObj } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';
	let targetObj;

	// eg. @if display(#myDiv) && has-class(#myDiv .shadedGreen) || var({player} "X")
	// etc.

	// First, remove @if clause.
	let statement = fullStatement;
	statement = statement.substr(ifType.length).trim();

	// Do any variable substituting, etc. before parsing string to get ready for evaluation.
//	let prepExpr = _prepareDetachedExpr(statement, varScope);

	// Parse remainder into a format that can potentially be evaluated and bring back a true or false value.
	let parsedStatement;
	if (ifType == '@else') {
		// If it is even getting into here, the evaluation is set true and the rest is handled in the same way as @if and @else if.
		parsedStatement = 'true';
	} else {
		// The evaluation of "@if" and "@else if" is handled in the same way.
		parsedStatement = _replaceConditionalsExpr(statement);
	}
	// Note: This hasn't been evaluated yet. This is just a check to see if the statement can be evaluated.

	if (parsedStatement !== false) {

		let thisIfObj = {
			evType,
			varScope,
			otherObj,
			sel: primSel,
			eve,
			doc,
			component,
			compDoc,
		};

		if (loopWhat != 'action' || typeof passTargSel == 'string') {
			// This is surrounding a target selector, so the reference object is the event receiver object.
			thisIfObj.obj = obj;
		} else if (typeof passTargSel == 'object') {
			thisIfObj.obj = passTargSel;
		}

		let res = _runIf(parsedStatement, fullStatement, thisIfObj);
		if (res) {
			// This is ok - run the inner contents.
			_runSecSelOrAction(loopObj);
		}

		return { ifType, res };
	}
	return false;
};

const _replaceConditionalsExpr = (str, varScope=null, o=null) => {
	// This function replaces ACSS conditionals dynamically (that have no "if-"), gets the return value as a string (ie. "true" or "false" and puts it
	// into the expression string for later evaluation.

	// Count parentheses. It's not possible to do matching parentheses with regex (unless using XRegExp) and account for all the possible combinations
	// of the insides that are not quoted. It needs to work with css selectors which are not quoted.
	// We could split by colon after escaping the colon preceding the pseudo-selectors and even embedded conditionals.
	// Like @if func(sadasd):func(sdfsdf .sdfsdf[escapedColon]not(sdfsdf)) {
	// That gives us an AND clause. But doesn't give us a way to have an OR, or a way to have complex () around AND and OR clauses.
	// Like @if (func(sadasd) && func(sdfsdf .sdfsdf[escapedColon]not(sdfsdf)) || func(sdfsdf)) && func(sdf) {
	// But it's easier just to split by (, then check for balanced parentheses once the function declaration has started.

	// First of all, as we're going to split by "(" and count ")", escape all "(" and ")" inside quotes and any single quotes that currently exist.
	let newStr = _escInQuo(str, '(', '__ACSSOpenP');
	newStr = _escInQuo(newStr, ')', '__ACSSClosP');
	newStr = _escInQuo(newStr, '\'', '__ACSSSingQ');
	// We're also going to escape any backslashes, so we avoid weirdness once we put commands in between quotes.
	newStr = _escInQuo(newStr, '\\', '__ACSSBSlash');

	// Error if the conditional has unbalanced parentheses.
	let countOp = newStr.split('(');
	if (countOp.length != newStr.split(')').length || countOp.length == 0) {
		_err('Opening/closing parentheses are unbalanced in @if statement, ' + str, o);
	}

	// Split by (function name)?\(. We need to do something to the function name to run it properly.
	// We do it like this so we don't have to get into parsing complex logic with AND and ORs.
	// We convert the ACSS syntax into using the actual conditional JavaScript functions instead and evaluate it as a whole after that.
	let arr = newStr.split(/([\![\s]*]?[\u00BF-\u1FFF\u2C00-\uD7FF\w\-]*\()/gim);

	/*
	Example for parsing and the resultant regex split:
		@if (var(cheese) && (has-class(sdfs(sdsdf .sdfsdf)) || var-true())) || var()
		""
		"("
		""
		"var("
		"cheese) && "
		"("
		""
		"has-class("
		""
		"sdfs("
		"sdsdf .sdfsdf)) || "
		"var-true("
		"))) || "
		"var("
		")"
	*/

	let funcJustStarted = false;
	let funcInProgress = false;
	let openInnerBrackets = 0;
	let outsideBrackets = 0;
	let erred = false;
	let condName = '';

	let newArr = arr.map(item => {
		if (item == '') return '';
		if (item == '(') {
			if (funcInProgress) {
				openInnerBrackets++;
			} else {
				outsideBrackets++;
			}
		} else if (!funcJustStarted && !funcInProgress) {
			// Possibly the start of a function in here. This is the only place a function name could be. It would have it's trailing "(".
			// The developer doesn't need to use the 'if' when writing in an if statement, but check it's existence out of courtesy so it isn't used twice.
			let start = 0;
			if (item.startsWith('!')) {
				start = 1;
			} else if (item.startsWith('not-')) {
				start = 4;
			}
			condName = item.slice(start, -1).trim();
			if (!condName.startsWith('if-')) condName = 'if-' + condName;

			// Test function. If it isn't present as stored conditional, built-in or custom, evaluate the original string.
			let func = condName._ACSSConvFunc();

			if (!_isCond(func)) return item;

			// Ok so far, start to reformat the conditional for JS parsing.
			funcJustStarted = true;
			if (start != 0) condName = '!' + condName;
			item = '_runAtIfConds(';

		} else {
			if (!funcInProgress) {
				funcInProgress = true;
				// Reached the start of the content of the function. Replace the function with data we need to call the conditional when evaluating.
				item = '\'' + condName + '\', ifObj, \'' + item;
			}
			// It could contain closing parentheses.
			// Count the number of closing parentheses.
			let numClosingBrackets = item.split(')').length - 1;
			let closingBracketCountDown = numClosingBrackets;
			if (numClosingBrackets > 0) {
				let bracketPos = item.indexOf(')');
				let lastBracketPos = bracketPos;
				while (bracketPos !== -1 && openInnerBrackets > 0) {
					openInnerBrackets--;
					bracketPos = item.indexOf(')', bracketPos + 1);
					closingBracketCountDown--;
					if (bracketPos !== -1) {
						lastBracketPos = bracketPos;
					}
				}
				if (openInnerBrackets <= 0) {
					funcJustStarted = false;
					funcInProgress = false;
					item = item.substr(0, lastBracketPos) + '\'' + item.substr(lastBracketPos);
					// Adjust counters to account for any trailing closing parentheses.
					let bracketsLeft = numClosingBrackets - closingBracketCountDown;
					if (bracketsLeft > 0) {
						bracketPos = item.indexOf(')', bracketPos + 1);
						outsideBrackets--;
						while (bracketPos !== -1 && outsideBrackets > 0) {
							outsideBrackets--;
							bracketPos = item.indexOf(')', bracketPos + 1);
						}
					}
				}
			} else {
				openInnerBrackets++;
			}

		}
		return item;
	});

	// Don't run anything if there has been an error.
	if (erred) return false;

	// Rejoin the array to form the final string and unescape the inner parentheses ready for evaluation.
	let arrStr = newArr.join('');
	arrStr = arrStr.replace(/__ACSSOpenP/g, '(');
	arrStr = arrStr.replace(/__ACSSClosP/g, ')');
	// The backslashes and quotes get substituted back into place in the conditional function runner itself during evaluation.
	// Doing it this way is better for performance as it avoids having to get into complex string manipulation - there's no point.

	return arrStr;
};

const _runAtIfConds = (condName, ifObj, str) => {
	// This is run during @if statement evaluation.
	// ifObj is set in _handleIf and passed in at the point of evaluation.
	// condFunc and str are set up in _replaceConditionalsExpr during string preparation before evaluation.
	let { evType, obj, varScope, otherObj, sel, eve, doc, component, compDoc } = ifObj;

	// Set up the conditional contents (the "action command") by unescaping what was escaped earlier.
	// The last two are needed for the comparison of strings without breaking the conditional parser.
	let condVal = str.replace(/__ACSSSingQ/g, '\'').replace(/__ACSSBSlash/g, '\\').replace(/"/g, '__ACSSDBQuote').replace(/ /g, '_ACSSspace');

	let clause = condName + '(' + condVal + ')';

	// Use _passesConditional to be able to use comma-delimited conditionals and custom conditionals - don't call _checkCond directly as it won't
	// cater for everything.

	// Run the conditional clause and return the result for use in the overall evaluation in _handleIf().
	let condObj = {
		el: obj,
		sel,
		clause,
		evType,
		ajaxObj: otherObj,
		doc,
		varScope,
		component,
		eve,
		compDoc
	};

	return _passesConditional(condObj);
};

const _runIf = (parsedStatement, originalStatement, ifObj) => {
	// Substitute any variables dynamically so they have the correct values at the point of evaluation and not earlier.
	let { obj, otherObj, varScope } = ifObj;

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str: parsedStatement,
			func: 'Var',
			obj,
			varScope
		}
	);
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	// Lastly, handle any {$STRING} value from ajax content if it exists.
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			o: otherObj,
			varScope
		},
		strObj.ref
	);
	// Output the variables for real from the map.
	let readyStatement = _resolveVars(strObj.str, strObj.ref);

	// Finally, remove any line breaks, otherwise things will barf when evaluated.
	readyStatement = readyStatement.replace(/\r|\n/gm, '');
	
	let res;
	try {
		res = Function('scopedProxy, ifObj, _runAtIfConds', '"use strict";return (' + readyStatement + ');')(scopedProxy, ifObj, _runAtIfConds);		// jshint ignore:line
	} catch (err) {
		console.log('Active CSS error: Error in evaluating @if statement, "' + originalStatement + '", check syntax.');
		console.log('Internal expression evaluated: ' + readyStatement, 'error:', err);
	}

	return res;
};

const _handleWhile = (loopObj) => {
	let { fullStatement, _imStCo, loopWhat, varScope, passTargSel, primSel, evType, obj, secSelObj, otherObj, eve, doc, component, compDoc } = loopObj;

	while (true) {
		// Done as a while to avoid getting into a memory leak.
		if (_checkBreakLoop(_imStCo)) break;

		// eg. @if display(#myDiv) && has-class(#myDiv .shadedGreen) || var({player} "X")
		// etc.

		// First, remove @if clause.
		let statement = fullStatement;
		statement = statement.substr(7).trim();

		// Parse remainder into a format that can potentially be evaluated and bring back a true or false value.
		let parsedStatement = _replaceConditionalsExpr(statement);
		// Note: This hasn't been evaluated yet. This is just a check to see if the statement can be evaluated.

		if (parsedStatement !== false) {
			let thisIfObj = {
				evType,
				varScope,
				otherObj,
				sel: primSel,
				eve,
				doc,
				component,
				compDoc
			};

			if (loopWhat != 'action' || typeof passTargSel == 'string') {
				// This is surrounding a target selector, so the reference object is the event receiver object.
				thisIfObj.obj = obj;
			} else if (typeof passTargSel == 'object') {
				thisIfObj.obj = passTargSel;
			}
			let res = _runIf(parsedStatement, fullStatement, thisIfObj);
			if (res) {
				// This is ok - run the inner contents.
				let loopObj2 = _clone(loopObj);
				_runSecSelOrAction(loopObj2);
				loopObj = loopObj2;
				// Clean up - this is proven to stop memory leak.
				loopObj2 = null;
			} else {
				break;
			}
		}
	}
};

const _addACSSStyleTag = (acssTag) => {
	let activeID = _getActiveID(acssTag);
	inlineIDArr.push(activeID);
	concatConfigLen++;
	_addConfig(acssTag.innerHTML, { file: '_inline_' + activeID, inlineActiveID: activeID });
	return activeID;
};

const _addConfig = (str, o) => {
	// Concatenate the config files before processing.
	// On empty config, throw a warning.
	let configItems;
	if (str.trim() == '') {
		if (o.file.startsWith('_inline_id-')) {
			console.log('There is an empty embedded ACSS style tag on the page. Skipping.');
		} else {
			console.log('There is a config file trying to load with no config present. Skipping. File: ' + o.file);
		}
		configItems = {};
	} else {
		// Before we add the config, we want to add line numbers for debug.
		let configLineArr = str.match(/^.*((\r\n|\n|\r)|$)/gm);
		let newStr = '';
		for (let n = 0; n < configLineArr.length; n++) {
			newStr += '*debugfile:' + o.file + ':' + (n + 1) + '*' + configLineArr[n];
		}
		str = newStr;

		configItems = _parseConfig(str, o.inlineActiveID);
	}

	concatConfigCo++;
	configBox.push({ file: o.file, styles: configItems });

	let tmpParse = {};
	parsedConfig = Object.assign(tmpParse, parsedConfig, configItems);

	// Set up CSS placeholder variable for extracting out any CSS that may be found in the ACSS.
	// o.inlineActiveID will be populated if embedded and o.file will contain that, otherwise o.inlineActiveID will be empty.
	// If not embedded, all the CSS can be appended to the same stylesheet as it can't be unloaded once added after ACSS initialisation or load-config.
	// If CSS needs to be removed, the developer would place it in an embedded CSS or ACSS style tag and not through initial config load or via load-config.
	_cssExtractInit(o.file);

	// If this is last file, run the config generator.
	if (!initInlineLoading && concatConfigCo >= concatConfigLen) {
		_readSiteMap(o);

		// Restart the sync queue if await was used.
		_syncRestart(o, o._subEvCo);
	}
};

const _addConfigError = (str, o) => {
	// Wipe any existing action commands after await, if await was used.
	_syncEmpty(o._subEvCo);

	// Needs an error handling.
	_handleEvents({ obj: o.obj, evType: 'loadconfigerror', eve: o.e });
};

const _assignLoopToConfig = (configObj, nam, val, file, line, intID, componentName, ev) => {
	let secsels, secselsLength, secsel, i, thisAct, secSelCounter = -1;

	if (_getLoopCommand(nam) !== false) {
		if (configObj[secSelCounter] === undefined) {
			configObj[secSelCounter] = [nam.replace(/acss_int_loop_comm/g, ',')];
		}
		configObj[secSelCounter] = _assignLoopToConfig(configObj[secSelCounter], val.name, val.value, val.file, val.line, val.intID, componentName, ev);
		return configObj[secSelCounter];
	}
	secsels = nam.split(',');
	secselsLength = secsels.length;
	for (i = 0; i < secselsLength; i++) {
		secsel = secsels[i].trim();
		// Is this a web component being declared? If so, set it up.
		secSelCounter++;
		for (thisAct in val) {
			if (val[thisAct].name == 'prevent-default') _checkPassiveState(componentName, ev);
			if (val[thisAct].type === undefined) continue;
			// Assign rule direct to the config. Nested if this is a loop.
			if (configObj[secSelCounter] === undefined) {
				configObj[secSelCounter] = [];
			}
			if (configObj[secSelCounter][secsel] === undefined) {
				// Note this next here needs to be an array and not an object, as we do splicing and adding later on from DevTools,
				// so we need to be flexible in the numbering.
				configObj[secSelCounter][secsel] = [];
			}
			// Add as a new rule.
			configObj[secSelCounter][secsel].push({ name: val[thisAct].name, value: val[thisAct].value, file: val[thisAct].file, line: val[thisAct].line, intID: val[thisAct].intID });

		}
	}
	return configObj;
};

// This script is only now used by the extension, and will need changing as of version 2.3.0 when work restarts on the extension.
// Commenting out for now, as it doesn't need to be in the minified core.
/*
const _assignRule = (compConfig, sel, ev, condition, secsel, ruleName, ruleValue, ruleFile, ruleLine, ruleIntID, secSelCounter, eachLoop=null) => {
	let rulePos;

	// Leave this here please.
//	console.log('_assignRule:');
//	console.log('compConfig = ' + compConfig);
//	console.log('sel = ' + sel);
//	console.log('ev = ' + ev);
//	console.log('condition = ' + condition);
//	console.log('secsel = ' + secsel);
//	console.log('ruleName = ' + ruleName);
//	console.log('ruleValue = ' + ruleValue);
//	console.log('ruleFile = ' + ruleFile);
//	console.log('ruleLine = ' + ruleLine);
//	console.log('eachLoop = ' + eachLoop);

	eachLoop = (eachLoop) ? eachLoop : '0';
	if (compConfig[sel][ev][condition][eachLoop] === undefined) {
		compConfig[sel][ev][condition][eachLoop] = {};
	}
	if (compConfig[sel][ev][condition][eachLoop][secSelCounter] === undefined) {
		compConfig[sel][ev][condition][eachLoop][secSelCounter] = [];
	}
	if (compConfig[sel][ev][condition][eachLoop][secSelCounter][secsel] === undefined) {
		// Note this next here needs to be an array and not an object, as we do splicing and adding later on from DevTools,
		// so we need to be flexible in the numbering.
		compConfig[sel][ev][condition][eachLoop][secSelCounter][secsel] = [];
	}

	// See if this rule already exists here.
	rulePos = ActiveCSS._getPosOfRule(compConfig[sel][ev][condition][eachLoop][secsel], ruleName);
	if (rulePos != -1) {
		// Append to the end of the existing rule value with a comma. Assume the developer knows what he or she is doing.
		compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value += ', ' + ruleValue;
		let newRuleFile = '', newRuleLine = '', newRuleIntID = '';
		if (compConfig[sel][ev][condition][eachLoop][secsel][rulePos].file) {
			newRuleFile = ',' + ruleFile;
			newRuleLine = ',' + ruleLine;
			newRuleIntID = ',' + ruleIntID;
		}
		compConfig[sel][ev][condition][eachLoop][secsel][rulePos].file += newRuleFile;
		compConfig[sel][ev][condition][eachLoop][secsel][rulePos].line += newRuleLine;
		compConfig[sel][ev][condition][eachLoop][secsel][rulePos].intID += newRuleIntID;
		return compConfig;
	}

	// Add as a new rule.
	compConfig[sel][ev][condition][eachLoop][secSelCounter][secsel].push({ name: ruleName, value: ruleValue, file: ruleFile, line: ruleLine, intID: ruleIntID });
	return compConfig;
};
*/

const _attachListener = (obj, ev, reGenEvent=false, isShadow=false) => {
	let opts = { capture: true };
	if (doesPassive) {
		if (nonPassiveEvents[ev] === true ||
				passiveEvents === false ||
				isShadow
			) {
			opts.passive = false;
		} else {
			opts.passive = true;
		}
	}
	if (doesPassive && reGenEvent) {
		// We are interested in a change from a passive to a non-passive from the addition of a prevent-default now being added to the config.
		// Any duplicate events added will get disregarded by the browser. This only happens in the document scope and for a document/component blend.
		// The reason for it not being more specific is that it's not worth the performance hit, being all about performance anyway and not functionality.
		// It could be made more specific later on if anyone complains. But it will need an actual real complaint before it's worth doing.
		obj.removeEventListener(ev, ActiveCSS._theEventFunction, { capture: true });
	}
	obj.addEventListener(ev, ActiveCSS._theEventFunction, opts);
};

// Keep this in here. The only reason it needs to be scoped to the root of Active CSS is because we need to remove an identical event listener, and we can only
// do that if a real function is used and is scoped higher up.
ActiveCSS._theEventFunction = e => {
	let ev = e.type;
	let component = e.target._acssComponent;
	let compDoc = (e.target instanceof ShadowRoot) ? e.target : undefined;
	let varScope = e.target._acssVarScope;
	if (!setupEnded) return;	// Wait for the config to fully load before any events start.
	let fsDet = _fullscreenDetails();
	switch (ev) {
		case 'click':
			if (!e.ctrlKey && !e.metaKey) {	// Allow default behaviour if control/meta key is used.
				_mainEventLoop('click', e, component, compDoc, varScope);
			}
			break;

		case 'keyup':
		case 'keydown':
			// A second Active CSS event is going to fire here to check if there is a specific key event.
			let ctrlCheck = (e.ctrlKey) ? 'Ctrl' : '';
			let metaCheck = (e.metaKey) ? 'Meta' : '';
			let shiftCheck = (e.shiftKey) ? 'Shift' : '';
			let funcKey = e.key;
			switch (e.key) {
				case ' ': funcKey = 'Space'; break;
				case ':': funcKey = 'Colon'; shiftCheck = ''; break;
				case ';': funcKey = 'Semicolon'; shiftCheck = ''; break;
				case '{': funcKey = 'OpenCurly'; shiftCheck = ''; break;
				case '}': funcKey = 'CloseCurly'; shiftCheck = ''; break;
				case '"': funcKey = 'DoubleQuotes'; shiftCheck = ''; break;
				case "'": funcKey = 'SingleQuote'; shiftCheck = ''; break;
				case '?': funcKey = 'Question'; shiftCheck = ''; break;
				case '!': funcKey = 'Exclamation'; shiftCheck = ''; break;
			}
			_mainEventLoop(ev + metaCheck + ctrlCheck + shiftCheck + funcKey, e, component, compDoc, varScope);
			_mainEventLoop(ev, e, component, compDoc, varScope);
			break;

		case fsDet[1] + 'fullscreenchange':
			_mainEventLoop(ev, e, component, compDoc, varScope);
			if (fsDet[0]) {
				_mainEventLoop('fullscreenEnter', e, component, compDoc, varScope);
			} else {
				_mainEventLoop('fullscreenExit', e, component, compDoc, varScope);
			}
			break;

		default:
			if (ev == 'change') {
				// Simulate a mutation and go straight to the observe event handler.
				_handleObserveEvents(null, compDoc);
			}
			_mainEventLoop(ev, e, component, compDoc, varScope);
	}
};

const _checkPassiveState = (componentName, ev) => {
	if (doesPassive) {
		let componentRef = !componentName ? 'doc' : componentName;
		let realEv = ev;	// Need to check for the key event, as the config event will be named differently, but the main key event needs to be set as not passive.
		if (ev.substr(0, 3) == 'key') {	// Micro-optimise, as it all adds up.
			if (ev.substr(0, 5) == 'keyup') {
				realEv = 'keyup';
			} else if (ev.substr(0, 7) == 'keydown') {
				realEv = 'keydown';
			}
		}	// The fullscreen events shouldn't need any sort of treatment as they are at window level and you can't prevent default there.
		if (nonPassiveEvents[realEv] === undefined) {
			nonPassiveEvents[realEv] = true;
		}
	}
};
// Credit goes to to https://github.com/aramk/CSSJSON for the initial regex parser technique that started this whole project off.
const _convConfig = (cssString, totOpenCurlies, co, inlineActiveID) => {
	// Note: By this point in initialisation the config should be compatible for parsing in a similar fashion to CSS.
	let node = {}, match = null, count = 0, bits, sel, name, value, obj, newNode, commSplit;
	let topLevel = (!co);
	while ((match = PARSEREGEX.exec(cssString)) !== null) {
		if (co > totOpenCurlies) {
			// Infinite loop checker.
			// If the count goes above the total number of open curlies, we know we have a syntax error of an unclosed curly bracket.
			_err('Syntax error in config - possibly an incomplete set of curly brackets or a missing end semi-colon.');
			return false;
		}
		if (match[PARSEDEBUG]) {
			commSplit = match[PARSEDEBUG].split(':');
			configFile = commSplit[1];
			configLine = commSplit[2].substr(0, commSplit[2].length - 1);
		} else if (match[PARSESEL]) {
			co++;
			name = match[PARSESEL].trim();
			name = name.replace(/\*debugfile[\s\S]*?\*/g, '');
			newNode = _convConfig(cssString, totOpenCurlies, co, inlineActiveID);
			if (newNode === false) return false;	// There's been a syntax error.
			name = _sortOutEscapeChars(name);
			if (inlineActiveID) name = name.replace(/embedded\:loaded/g, '~_embedded_' + inlineActiveID + ':loaded');
			obj = {
				name,
				value: newNode,
				line: configLine,
				file: configFile,
				intID: intIDCounter++,
				type: 'rule'
			};
			// If this is the top-level, assign an incrementing master value than spans all config files. If not, use the inner loop counter.
			let counterToUse = (topLevel) ? masterConfigCo++ : count++;
			node[counterToUse] = obj;
		} else if (match[PARSEEND]) { return node;	// Found closing brace
		} else if (match[PARSEATTR]) {
			// Handle attributes.
			// Remove any comments lurking.
			var line = match[PARSEATTR].trim();
			line = line.replace(/\*debugfile[\s\S]*?\*|([^:]|^)\/\/.*$/g, '');
			var attr = PARSELINEX.exec(line);
			if (attr) {
				// Attribute
				obj = {
					name: _sortOutEscapeChars(attr[1].trim()),
					value: _sortOutEscapeChars(attr[2].trim()),
					type: 'attr',
					line: configLine,
					file: configFile,
					intID: intIDCounter++
				};
				node[count++] = obj;
			} else {
				node[count++] = line;
			}
		}
	}
	return node;
};

const _getInline = (inlineConfigTags) => {
	// Initial embedded style type="text/acss" detection prior to any user config.
	inlineConfigTags.forEach(acssTag => {
		_addACSSStyleTag(acssTag);	// This function as well as adding the config returns the applicable Active ID for use in running the loaded event.
	});
};

ActiveCSS._getPosOfRule = (list, item) => {
	return _getValFromList(list, item, true);
};

const _initScriptTrack = () => {
	document.querySelectorAll('script').forEach(function (obj, index) {
		if (scriptTrack.indexOf(obj.src) === -1) scriptTrack.push(obj.src);
	});
};

const _isFromFile = (fileToRemove, configPart) => {
	let item, i, configPartLen = configPart.length, key;
	if (configPartLen == 0) {
		for (key in configPart) {
			if (_isFromFile(fileToRemove, configPart[key])) {
				return true;
			}
		}
	} else {
		for (i = 0; i < configPartLen; i++) {
			item = configPart[i];
			if (_isArray(item)) {
				if (_isFromFile(fileToRemove, item)) {
					return true;
				}
			} else {
				let thisFile = item.file;
				if (thisFile === fileToRemove) {
					return true;
				}
			}
		}
	}
	return false;
};

const _iterateConditionals = (conditions, rules, sel) => {
	var counter, ruleName, ruleValue;
	Object.keys(rules).forEach(function(key) {
		ruleName = rules[key].name;
		// Check it has valid syntax.
		if (!ruleName) return;
		counter = conditions[sel].length;
		conditions[sel][counter] = {};
		if (!CONDCOMMAND.test(ruleName)) {
			_warn('Invalid conditional command name (see More info below)', null, ruleName);
			return;
		}
		if (typeof rules[key].value != 'string') {
			_warn('Invalid value for conditional ' + ruleName + ' (see More info below)', null, rules[key].value);
			return;
		}
		conditions[sel][counter].name = ruleName;
		conditions[sel][counter].value = rules[key].value;
		conditions[sel][counter].file = rules[key].file;
		conditions[sel][counter].line = rules[key].line;
		conditions[sel][counter].intID = rules[key].intID;
	});
	return conditions;
};

const _iteratePageList = (pages, removeState=false) => {
	// This is a cumulative action to what is there already, if anything, or a removal action.
	if (!('content' in document.createElement('template'))) {
		// Leave this as regular console.log, as this probably wouldn't handle correctly in the error handling anyway.
		console.log('Browser does not support html5. Cannot instantiate page navigation.');
		return;
	}

	var page, toRemove = [], toRemoveWild = [], isWild, obj, regex;
	Object.keys(pages).forEach(function(key) {
		page = pages[key].name;
		if (!page) return;
		page = page._ACSSRepAllQuo();	// remove any quotes as we're going to match the attribute value itself on finding later.

		// Check if this is a wildcard URL, as it goes into a different place for speed checking when working out realtime pagenav.
		let isWild = (page.indexOf('*') !== -1);

		if (removeState) {
			// Will be faster to run one filter at the end and just store the values to remove in an array here, rather than a filter for each iteration.
			if (isWild) {
				toRemoveWild.push(page);
			} else {
				toRemove.push(page);
			}
		} else {
			obj = { url: page, attrs: _unEscNoVars(_replaceRand(pages[key].value)) };
			if (isWild) {
				// This is the wildcard string converted into a regex for matching later. The latter regex is anything not a dot or a back/forward slash.
				regex = new RegExp(_escForRegex(page).replace(/\\\*/g, '((?!\\/|\\/|\\.).)*'), 'g');
				obj.regex = regex;
				pageWildcards.push(obj);
			} else {
				pageList.push(obj);
			}
		}
	});

	if (removeState) {
		if (isWild) {
			pageWildcards = pageWildcards.filter(item => toRemoveWild.indexOf(item.url) == -1);
		} else {
			pageList = pageList.filter(item => toRemove.indexOf(item.url) == -1);
		}
	}
};

const _iterateRules = (compConfig, rules, sel, ev, condition, componentName=null) => {
	let thisAct, ruleName, ruleValue, page, pageTitle, secsels, secselsLength, secsel, i, nam, val;
	let secSelCounter = -1;
	Object.keys(rules).forEach(function(key2) {
		nam = rules[key2].name;
		val = rules[key2].value;
		if (!nam) return;
		// Look for and handle any loop around potentially multiple secondary selectors.
		if (_getLoopCommand(nam) !== false) {
			// Recurse and set up each loop.
			secSelCounter++;
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter][nam] = _iterateRules([], val, sel, ev, condition, componentName);
			return;
		}
		// Sort out actions addressed to the event selector, on the top-level with no secondary selector.
		if (typeof val === 'string') {
			// This is a top level action command directly under a primary selector. Assign it to the & secondary selector for use.
			// This must always go to a &, because the target needs to reflect the item evented on, not the primary selector, which may include multiple elements.
			// It needs to be able to refer to ONE element - the target which received the event.
			// Ie. the event is on a class, which is in more than one element, but only one of them was clicked on. We want THAT one, not the whole class
			// as the secondary selector. This is *really* important to remember, if anything in the code is optimised.
			secSelCounter++;
			if (nam == 'prevent-default') _checkPassiveState(componentName, ev);
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter]['&'] = [];
			compConfig[secSelCounter]['&'].push({ name: nam, value: val, file: rules[key2].file, line: rules[key2].line, intID: rules[key2].intID });
			return;
		}
		page = '';
		pageTitle = '';
		// Allow multiple secondary selectors. Split by comma. These will be arranged in the final config array in sequence.
		secsels = nam.split(',');
		secselsLength = secsels.length;
		for (i = 0; i < secselsLength; i++) {
			secsel = secsels[i].trim();
			// Is this a web component being declared? If so, set it up.
			secSelCounter++;
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter][secsel] = [];
			for (thisAct in val) {
				if (val[thisAct].type === undefined) continue;
				if (secsel == '&' && val[thisAct].name == 'prevent-default') _checkPassiveState(componentName, ev);
				compConfig[secSelCounter][secsel].push({ name: val[thisAct].name, value: val[thisAct].value, file: val[thisAct].file, line: val[thisAct].line, intID: val[thisAct].intID });
			}
		}
	});

	return compConfig;
};

const _makeVirtualConfig = (subConfig='', statement='', componentName=null, removeState=false, fileToRemove='') => {
	// Loop through the config, splitting up multi selectors and giving them their own entry. Put this into the config.
	// There is also now an option to remove a set of config settings declared in parsedConfig by setting the removeState par to true.
	let pConfig = (subConfig !== '') ? subConfig : parsedConfig;
	let str, strLength, i, strTrimmed, strTrimCheck, isComponent, innerContent, selectorName, evSplit, ev, sel, isConditional;
	let inlineActiveID = fileToRemove.substr(8);
	Object.keys(pConfig).forEach(function(key) {
		if (!pConfig[key].name) return;
		selectorName = pConfig[key].name;
		innerContent = pConfig[key].value;
		isConditional = false;
		// Split by comma, but not any that are in parentheses, as those are in selector functions.
		str = selectorName.split(/,(?![^\(\[]*[\]\)])/);
		strLength = str.length;
		for (i = 0; i < strLength; i++) {
			strTrimmed = str[i].trim();
			// This could be a component that has an event, so we force the below to skip recognising this as a component.
			isComponent = strTrimmed.startsWith('@component ');
			// First check if this is a part of a comma-delimited list of conditionals, then do other stuff to set up for the switch statement.
			// It could look like '?cheese, ?trevor' or '?cheese, trevor', and they would all be conditionals, so these next lines cater for a missing ?.
			let noQuestionMark;
			strTrimCheck = (isConditional && (noQuestionMark = strTrimmed.indexOf('?') === -1)) ? '?' : (!isComponent || isComponent && str[i].indexOf(':') === -1) ? strTrimmed.slice(0, 1) : '';
			switch (strTrimCheck) {
				case '?':
					// This is a conditional. This puts the conditional in memory for later use.
					// When it comes to trapping the use of the conditional, the reference to it is set in the config
					// for the event, so that is also part of setting up the config.
					let condName = (noQuestionMark) ? strTrimmed : strTrimmed.substr(1);
					if (componentName) {
						condName = '|' + componentName + '|' + condName;
					}
					if (!removeState) {
						conditionals[condName] = (conditionals[condName] === undefined) ? [] : conditionals[condName];
						conditionals = _iterateConditionals(conditionals, innerContent, condName);
					} else {
						delete conditionals[condName];	// Safe removal. There is no length property on the conditionals object.
					}
					isConditional = true;
					break;

				case '@':
					if (strTrimmed == '@pages') {
						// This is a page list declaration. Append it to any others previously found.
						_iteratePageList(innerContent, removeState);
					} else if (isComponent) {
						// This is an html component. Stored like the conditional but in a different place.
						let compName = strTrimmed.split(' ')[1].trim();
						if (!removeState) {
							if (!components[compName]) components[compName] = {};
							components[compName].mode = null;
							components[compName].shadow = false;
							components[compName].scoped = false;
							components[compName].strictVars = false;
							components[compName].strictPrivEvs = false;
							components[compName].privVars = false;
							components[compName].privEvs = false;
							let checkStr = strTrimmed + ' ';
							// Does this have shadow DOM creation instructions? ie. shadow open or shadow closed. Default to open.
							if (checkStr.indexOf(' shadow ') !== -1) {
								components[compName].shadow = true;
								components[compName].mode = (strTrimmed.indexOf(' closed') !== -1) ? 'closed' : 'open';
							}
							if (checkStr.indexOf(' strictlyPrivateVars ') !== -1 || checkStr.indexOf(' strictlyPrivate ') !== -1) {
								components[compName].strictVars = true;
								components[compName].privVars = true;
								components[compName].scoped = true;
							} else if (checkStr.indexOf(' privateVars ') !== -1 || checkStr.indexOf(' private ') !== -1) {
								components[compName].privVars = true;
								// Private variable areas are always scoped, as they need their own area.
								// We get a performance hit with scoped areas, so we try and limit this to where needed.
								// The only other place we have an area scoped is where events are within components. Shadow DOM is similar but has its own handling.
								components[compName].scoped = true;
							}
							if (checkStr.indexOf(' strictlyPrivateEvents ') !== -1 || checkStr.indexOf(' strictlyPrivate ') !== -1) {
								components[compName].strictPrivEvs = true;
							} else if (checkStr.indexOf(' privateEvents ') !== -1 || checkStr.indexOf(' private ') !== -1) {
								components[compName].privEvs = true;
							}
						}
						// Recurse and set up componentness.
						_makeVirtualConfig(innerContent, '', compName, removeState, fileToRemove);
						if (!removeState) {
							// Handle no html content.
							if (components[compName].data === undefined) {
								components[compName].data = '';
								components[compName].file = '';
								components[compName].line = '';
								components[compName].intID = '';
							}
							// Reset the component name, otherwise this will get attached to all the remaining events.
						} else {
							delete components[compName];
						}
						compName = '';
					} else {
						// Check if the at-rule starts with @media or @support.
						let isMedia = strTrimmed.startsWith('@media ');
						let isSupport = strTrimmed.startsWith('@support ');
						if (isMedia || isSupport) {
							if (!removeState) {
								// This is a media query type of statement. Set it up and call the config routine again so the internal media query name can be attached to the events.
								statement = _setupMediaQueryHandler(strTrimmed);
								// Recurse and set up a conditional node.
								if (statement !== false) _makeVirtualConfig(innerContent, statement, null, removeState, fileToRemove);
								// Reset the media query name, otherwise this will get attached to all the remaining events.
							} else {
								// For the moment, media queries do not get deleted.
							}
							statement = '';
						} else {
							// This looks like a regular CSS at-rule.
							_cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							continue;
						}
					}
					break;

				default:
					if (strTrimmed == 'html') {
						if (!removeState) {
							if (componentName) {
								// This is component html.
								components[componentName].data = innerContent[0].value.slice(1, -1);	// remove outer quotes;
								components[componentName].data = components[componentName].data.replace(/\\\"/g, '"');
								components[componentName].file = innerContent[0].file;
								components[componentName].line = innerContent[0].line;
								components[componentName].intID = innerContent[0].intID;
							}
						} else {
							if (componentName) delete components[componentName];
						}
					} else {
						// This is an event.
						// Could be colons in selector functions which we need to ignore in the split.
						// But there could be a colon at the beginning, in which case the first item in the array will be empty and it will not be an
						// internal conditional.
						evSplit = strTrimmed.split(/:(?![^\(\[]*[\]\)])/);

						// The first item in the array will always be the main selector, and the last will always be the event.
						// The middle can be a mixture of conditions.
						if (!evSplit[1]) {	// This has no split selector entry and could be a CSS command.
							// Is it contained inside a component declaration? If so, it's an error.
							if (componentName) {
								_warn(strTrimmed + ' is not a fully formed selector - it may be missing an event or have incorrect syntax. Or you have too many closing curly brackets.');
							} else {
								// This looks like a regular CSS command.
								_cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							}
							continue;
						}
						if (evSplit[0] == '') {
							evSplit.shift();	// Get rid of the empty item.
							sel = ':' + evSplit.shift();	// Get the first selector part and put the colon back in.
						} else {
							sel = evSplit.shift();	// Get the first selector part (get the beginning clause and remove from array)
						}

						if (removeState) {
							if (sel == '~_embedded_' + inlineActiveID) {
								delete config[sel];
								continue;
							}
						}
						ev = evSplit.pop();	// Get the event (get the last clause and remove from array)
						ev = ev.trim();

						// Check that the event isn't a regular CSS command.
						if (ev.match(COLONSELS) && ev !== 'focus') {
							// This looks like a regular CSS command.
							_cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							continue;
						}

						let predefs = [], conds = [];
						if (evSplit.length > 0) {	// Only run this if there is anything left in the clause array.
							// Loop the remaining selectors, pop out each one and assign to the correct place in the config.
							// Ie. either after the selector for DOM queries, or as part of the conditional array that gets
							// attached to the event.
							let clause;
							for (clause of evSplit) {
								if (clause.match(COLONSELS)) {
									predefs.push(clause);
								} else {
									conds.push(clause);
								}
							}
						}
						// Does this need a media query conditional adding?
						if (statement !== '') {
							conds.push(statement);
						}
						if (predefs.length > 0) {
							sel += ':' + predefs.join(':');	// Put the valid DOM selector clauses back.
						}
						// Set up the event in the config.
						// If this is an event for a component, it gets a special handling compared to the main document. It gets a component prefix.
						if (componentName) {
							sel = '|' + componentName + ':' + sel;
							if (!removeState) {
								shadowSels[componentName] = (shadowSels[componentName] === undefined) ? [] : shadowSels[componentName];
								shadowSels[componentName][ev] = true;	// We only want to know if there is one event type per shadow.

								// Targeted events get set up only when a shadow is drawn, as they are attached to the shadow, not the document. No events to set up now.
								// All non-shadow components are now scoped so that events can occur in any component, if there are any events.
								components[componentName].scoped = true;
							} else {
								delete shadowSels[componentName];
								delete components[componentName];
							}
						}

						if (!removeState) {
							config[sel] = (config[sel] === undefined) ? {} : config[sel];
							config[sel][ev] = (config[sel][ev] === undefined) ? {} : config[sel][ev];
						}

						let conditionName;
						if (conds.length === 0) {
							conditionName = 0;
						} else {
							// Concat the conditions with a space.
							conditionName = conds.join(' ');
						}

						if (!removeState) {
							preSetupEvents.push({ ev, sel });
							if (config[sel][ev][conditionName] === undefined) {
								config[sel][ev][conditionName] = [];
							}
						}

						if (!removeState) {
							config[sel][ev][conditionName].push(_iterateRules([], innerContent, sel, ev, conditionName, componentName));
						} else if (config[sel] !== undefined) {
							// Find and remove items from config based on file value.
							let i, len = config[sel][ev][conditionName].length;
							let toRemove = [];
							for (i = 0; i < len; i++) {
								if (_isFromFile(fileToRemove, config[sel][ev][conditionName][i])) {
									toRemove.push(i);
								}
							}
							for (i of toRemove) {
								config[sel][ev][conditionName].splice(i, 1);
							}
							if (config[sel][ev][conditionName].length == 0) {
								delete config[sel][ev][conditionName];
							}
							if (Object.keys(config[sel][ev]).length === 0) {
								delete config[sel][ev];
							}
							if (Object.keys(config[sel]).length === 0) {
								delete config[sel];
							}
						}
					}
			}
		}
	});
	if (subConfig !== '') return;		// Return the sub-config - we just handled media query contents.

	let debugConfig = (debugMode) ? _doDebug('config') : false;
	if (debugConfig) {
		Object.keys(config).sort().forEach(function(key) {
			console.log(key, config[key]);
		});
	}
	debugConfig = (debugMode) ? _doDebug('conditionals') : false;
	if (debugConfig) {
		Object.keys(conditionals).sort().forEach(function(key) {
			console.log(key, conditionals[key]);
		});
	}
	debugConfig = (debugMode) ? _doDebug('components') : false;
	if (debugConfig) {
		Object.keys(components).sort().forEach(function(key) {
			console.log(key, components[key]);
		});
	}
};

ActiveCSS._mapRegexReturn = (mapObj, str, mapObj2=null, caseSensitive=false) => {
	if (typeof str !== 'string') return str;	// If it's not a string, we don't have to replace anything. Here for speed.
	let reg = new RegExp(Object.keys(mapObj).join('|'), 'g' + (!caseSensitive ? 'i' : '') + 'm');

	str = str.replace(reg, function(matched){
		if (!mapObj2) {
			return matched == '\\' ? mapObj['\\\\'] : mapObj[matched];
		} else {
			// Match with a second object, not the regex object.
			return mapObj2[matched];
		}
	});
	return str;
};

const _parseConfig = (str, inlineActiveID=null) => {
	// Keep the parsing regex for the config arrays as simple as practical.
	// The purpose of this script is to escape characters that may get in the way of evaluating the config sanely during _makeVirtualConfig.
	// There may be edge cases that cause this to fail, if so let us know, but it's usually pretty solid for practical use.
	// External debugging tools can be set up for line syntax checking - keep the engine at optimum speed.
	// If someone wants to thrash test it, please let support know of any exceptional cases that should pass but don't.
	// There are quite possibly unnecessary bits in the regexes. If anyone wants to rewrite any so they are more accurate, that is welcome.
	// This sequence, and the placing into the config array after this, is why the core is so quick, even on large configs. Do not do manually looping on
	// the main config. If you can't work out a regex for a new feature, let the main developers know and they'll sort it out.
	if (inlineActiveID) str = _unEscNoVars(str);
	// Remove all comments. But not comments within quotes. Easy way is to escape the ones inside, then run a general removal, and then unescape.
//	str = str.replace(INQUOTES, function(_, innards) {
//		return innards.replace(/\/\*/gm, '_ACSSOPCO').replace(/\/\*/gm, '_ACSSCLCO');
//	});

	str = str.replace(COMMENTS, '');
//	str = str.replace(/_ACSSOPCO/gm, '/*').replace(/_ACSSCLCO/, '*/');
	// Remove line-breaks, etc., so we remove any multi-line weirdness in parsing.
	str = str.replace(/[\r\n]+/g, '');
	// Replace escaped quotes with something else for now, as they are going to complicate things.
	str = str.replace(/\\\"/g, '_ACSS_escaped_quote');

	// Convert @command into a friendly-to-parse body:init event. Otherwise it gets unnecessarily messy to handle later on due to being JS and not CSS.
	let systemInitConfig = '';
	str = str.replace(/@command[\s]+(conditional[\s]+)?([\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+[\s]*\{\=[\s\S]*?\=\})/g, function(_, typ, innards) {
		// Take these out of whereever they are and put them at the bottom of the config after this action. If typ is undefined it's not a conditional.
		let sel, ev;
		if (inlineActiveID) {
			sel = '~_embedded_' + inlineActiveID;
			ev = 'loaded';
		} else {
			sel = '~_acssSystem';
			ev = !setupEnded ? 'init' : 'afterLoadConfig';
		}
		systemInitConfig += sel + ':' + ev + '{' + (!typ ? 'create-command' : 'create-conditional') + ':' + innards + ';}';
		return '';
	});
	str += systemInitConfig;

	// Sort out raw JavaScript in the config so it doesn't clash with the rest of the config. The raw javascript needs to get put back to normal at evaluation time,
	// and not before, otherwise things go weird with the extensions.
	// With the extensions, there is a similar routine to put these escaped characters back in after a modification from there - it's not the same thing though,
	// as this handles the whole config, not just a particular part of it, so it is necessarily a separate thing (_escapeCharsForConfig.js).
	str = str.replace(/\{\=([\s\S]*?)\=\}/g, function(_, innards) {
		if (innards.indexOf('*debugfile:') !== -1) {	// It's not there for a JavaScript expression (eg "new Date()").
			// We only want the last debugfile string (file, line data) if it is there - remove the last "*" so it fails the next regex.
			innards = innards.trim().slice(0, -1);
			// Get rid of full debugfile entries, which always end in a "*".
			innards = innards.replace(/\*debugfile\:[\s\S]*?\*/g, '');	// get rid of any other debug line numbers - they just get in the way and we don't need them.
			// Put the last "*" back so there is only the last debugline string in there.
			innards += '*';
		}
		return '_ACSS_subst_equal_brace_start' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '_ACSS_subst_equal_brace_end';
	});

	// Handle continue; and break; so they parse later on. This can be optimised, and also made to work with whitespace before the semi-colon as it doesn't here.
	// Put these into a general non-colon command array.
	str = str.replace(/("(.*?)")/g, function(_, innards) {
		innards = innards.replace(/continue\;/g, '_ACSS_continue');
		innards = innards.replace(/break\;/g, '_ACSS_break');
		innards = innards.replace(/exit\;/g, '_ACSS_exit');
		innards = innards.replace(/exit\-target\;/g, '_ACSS_exittarg');
		return innards;
	});
	str = str.replace(/('(.*?)')/g, function(_, innards) {
		innards = innards.replace(/continue\;/g, '_ACSS_continue');
		innards = innards.replace(/break\;/g, '_ACSS_break');
		innards = innards.replace(/exit\;/g, '_ACSS_exit');
		innards = innards.replace(/exit\-target\;/g, '_ACSS_exittarg');
		return innards;
	});
	str = str.replace(/(?:[\s\;\{]?)continue\;/g, 'continue:1;');
	str = str.replace(/(?:[\s\;\{]?)break\;/g, 'break:1;');
	str = str.replace(/(?:[\s\;\{]?)exit\;/g, 'exit:1;');
	str = str.replace(/(?:[\s\;\{]?)exit\-target\;/g, 'exit\-target:1;');
	str = str.replace(/_ACSS_continue/g, 'continue;');
	str = str.replace(/_ACSS_break/g, 'break;');
	str = str.replace(/_ACSS_exit/g, 'exit;');
	str = str.replace(/_ACSS_exittarg/g, 'exit-target;');

	// Handle any embedded Active CSS style tags and convert to regular style tags.
	str = str.replace(/acss\-style/gi, 'style');
	// Escape all style tag innards. This could contain anything, including JS and other html tags. Straight style tags are allowed in file-based config.
	str = str.replace(/<style>([\s\S]*?)<\/style>/gi, function(_, innards) {
		return '<style>' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '</style>';
	});
	// Replace variable substitutations, ie. {$myVariableName}, etc.
	str = str.replace(/\{\$([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_dollar_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\" \.\[\]]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
//		innards = innards.replace(/'/g, '"');	// this breaks single quotes in variables referenced in attributes when rendering.
		return '_ACSS_subst_brace_start_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\{\$\|\#\:]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_brace_start_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\{\$\|\#\:]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\'\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_pipe_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\:\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_hash_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\"\. \$\[\]\(\)]+)\}/gi, function(_, innards) {
		if (innards.trim() == '') return '{}';
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
//		innards = innards.replace(/'/g, '"');	// this breaks single quotes in variables referenced in attributes when rendering.
		return '_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	// Sort out component escaping.
	// First, replace all escaped curlies with something else.
	str = str.replace(/\\{/g, '_ACSS_later_escbrace_start');
	str = str.replace(/\\}/g, '_ACSS_later_escbrace_end');

	// Now we can match the component accurately. The regex below should match all components.
	str = str.replace(/([^\u00BF-\u1FFF\u2C00-\uD7FF\w\-]html[\s]*{)([\s\S]*?)}/gi, function(_, startBit, innards) {
		// Replace existing escaped quote placeholder with literally escaped quotes.
		innards = innards.replace(/_ACSS_escaped_quote/g, '\\"');
		// Now escape all the quotes - we want them all escaped, and they wouldn't have been picked up before.
		innards = innards.replace(/"/g, '_ACSS_escaped_quote');
		// Escape all tabs, as after this we're going to remove all tabs from everywhere else in the config and change to spaces, but not in here.
		innards = innards.replace(/\t/g, '_ACSS_tab');
		// Now format the contents of the component so that it will be found when we do a css-type object creation later.
		return startBit + '{component: "' + innards + '";}';
	});

	// Convert tabs to spaces in the config so that multi-line breaks will work as expected.
	str = str.replace(/\t+/g, ' ');
	// Unconvert spaces in component html back to tabs so that HTML can render as per HTML rules.
	str = str.replace(/_ACSS_tab/g, '\t');

	// Now we have valid quotes, etc., we want to replace all the key characters we are using in the cjs config within
	// quotes with something else, to be put back later. This is so we can keep the parsing simple when we generate the
	// tree structure. We need to escape all the key characters that the json parser uses to work out the structure.
	// We will put all the valid characters back when we are setting up the json objects after it has passed "css" validation.
	let mapObj = {
		'{': '_ACSS_brace_start',
		'}': '_ACSS_brace_end',
		';': '_ACSS_semi_colon',
		':': '_ACSS_colon',
		'/': '_ACSS_slash',
		'@': '_ACSS_at',
	};
	str = str.replace(/("([^"]|"")*")/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});
	// Convert @conditional into ?, so we don't have to bother with handling that in the parser.
	str = str.replace(/@conditional[\s]+/g, '?');
	// Do a similar thing for parentheses. Handles pars({#formID}&mypar=y) syntax.
	str = str.replace(/([\(]([^\(\)]|\(\))*[\)])/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});
	// Sort out var action command syntax, as that could be pretty much anything. This might need tweaking.
	str = str.replace(/[\s]*var[\s]*\:([\s\S]*?)\;/gim, function(_, innards) {
		return 'var: ' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + ';';
	});

	// Infinite loop failsafe variable. Without this, unbalanced curlies may call an infinite loop later.
	let totOpenCurlies = str.split('{').length;

	// Now run the actual parser now that we have sane content.
	let obj = _convConfig(str, totOpenCurlies, 0, inlineActiveID);
	if (!Object.keys(obj).length) {
		_err('There is a structural syntax error at initial parsing stage. Config that failed to parse: ' + str);
	}

	return obj;
};

const _readSiteMap = (o) => {
	// We have the config file loaded. Go through the config file and sort out the website objects and properties.
	// This is an SPA so we do everything first in a speedy fashion - we only do this once.
	// Don't forget that load-config runs this too, so anything for first initialization needs to be with the !setupEnded condition.
	var debugConfig = (debugMode) ? _doDebug('parser') : false;
	if (debugConfig) console.log(parsedConfig);

	if (!setupEnded) {
		// We are going to automatically set up which events can be declared as passive events, and we need to know if the browser supports passive events (doesPassive).
		_setupPassive();
	}

	// Make a new virtual config, which has split up selectors. We do this so we can do quick finding of event handlers and not have to iterate anything.
	_makeVirtualConfig();

	// Reset the parsed config array so it is ready for new config to be added later.
	parsedConfig = {};

	// Create any CSS style tags that have been extracted out from the loaded ACSS config. This handles both loaded and embedded config.
	_cssExtractAddTags();

	// Set up events. We can only do this after the config is fully loaded, as there could be multiple events of the same type and we need to know if they are
	// passive or not (if they use prevent-default or not).
	let evSet;
	for (evSet of preSetupEvents) {
		_setupEvent(evSet.ev, evSet.sel);
	}
	if (!selectors.click && selectors.clickoutside) {
		// Need at least one click event for clickoutside to work and there isn't one set. Set up a dummy event so it goes through the regular flow.
		_setupEvent('click', 'body');
	}
	// Clean up. If we run load-config, we'll run this function again and only attempt to add the new events loaded.
	preSetupEvents = [];

	// Set up a separate change event for triggering an observe event on the native input event and for otherwise undetectable property changes.
	// Apologies in advance if this looks like a hack. If anyone has any better ideas to cover these scenarios, let me know.
	window.addEventListener('input', _handleObserveEvents);
	window.addEventListener('click', () => { setTimeout(_handleObserveEvents, 0); });

	if (!setupEnded) {
		_startMainListen();
	}

	// Put all the existing script tag details into memory so we don't load things up twice if load-script is used.
	_initScriptTrack();

	_wrapUpStart(o);
};

const _regenConfig = (styleTag, opt) => {
	// Regenerate the config at the end of the current stack so we don't get a condition in the event flow that actions no longer exist.
	// There was a end-stack delay I don't think we need the delay now - the removal of config has been placed inside render itself.
	let activeID = styleTag._acssActiveID;
	switch (opt) {
		case 'remove':
			// Remove the tag details from the config.
			parsedConfig = configBox.find(item => item.file == '_inline_' + activeID).styles;
			// Remove any potentially extracted CSS from the page that came from this ACSS config tag.
			cssExtractRemoveTag('_inline_' + activeID);
			// Now run _makeVirtualConfig() with the option to remove matching config.
			_makeVirtualConfig('', '', null, true, '_inline_' + activeID);
			// Now remove the tag from configBox.
			concatConfigCo--;
			concatConfigLen--;
			configBox = configBox.filter(item => item.file != '_inline_' + activeID);
			parsedConfig = {};
			break;

		case 'addDevTools':
			_addACSSStyleTag(styleTag);
	}
};

const _runInlineLoaded = () => {
	inlineIDArr.forEach(activeID => {
		_handleEvents({ obj: '~_embedded_' + activeID, evType: 'loaded' });
	});
	inlineIDArr = [];
};

const _setupEvent = (ev, sel, component) => {
	if (selectors[ev] === undefined) {
		selectors[ev] = [];
	}
	// We are giving the main navig keys events, as they are commonly used in UI. Prefixed by keyup 
	if (selectors[ev].includes(sel)) {
		if (!setupEnded || !doesPassive) {
			return;
		}
		// Let it through - this could be a load-config with a prevent-default now changing the passive "true" state to false. We need to replace the event listener.
		// This will only happen on a document level - not a shadow DOM level. Events in the shadow DOM can only be added when it is created - _attachListener() is
		// called directly from _renderCompDomsDo().
	} else {
		selectors[ev].push(sel);
	}
	if (debuggerEvs.includes(ev)) {
		if (!setupEnded || !doesPassive) {
			return;
		}
		// Let it through.
	} else {
		debuggerEvs.push(ev);	// Push the event onto the debugger event list.
	}
	ev = _getRealEvent(ev);
	if (ev === false) return;
	if (setupEnded || !eventState[ev]) {
		// We could store a variable tracking before passive states of already set up events, rather than running this on every load-config for all new events.
		// This isn't set up yet though. It would need check the before passive status of an event, and if it is not false - run this - otherwise skip it. It's
		// a micro-optimizing point - slap it on the list. It's not an initial load time speed change though - that won't be further optimized by that change,
		// only later load-config actions, which as I said, are more than likely to contain less events than the main config. Unless the person is lazy-loading
		// everything because they already have a slow page. In that case a few microseconds extra won't make a difference particularly. So it's micro-optimization.
		// It might not even be worth it.
		let obj = (document.parentNode && sel == 'body' && ev == 'scroll') ? document.body : window;
		// Re-gen event. We need this, because of the dynamic shadow DOM event adding, which always happens after setup but is actually not a regeneration of an event.
		_attachListener(obj, ev, setupEnded);
		eventState[ev] = true;
	}
};

const _setupMediaQueryHandler = str => {
	// Eg. str = '(orientation: portrait)', 
	// Note: We need the calling object in order to get the correct window for the media query check.

	// This is how we are going to handle media queries.
	// 1. When the config is read, we set up event listeners which will run a function when they change.
	// 2. When they change, we run that function and set the true/false variable of the internal media query reference to true or false. We only do this once.
	// 3. When the media query conditional statement executes, it just reads the property of the true/false variable. That way we can handle many many
	// media queries with no performance impact.
	// 4. Note: media query setups should only work in the content window they relate to, so this only needs window, not contentWindow. The reason being that
	// in css, media queries only relate to the window they are defined in. We could do a cross-iframe push of data up and down for info purposes, but don't
	// worry about that for the moment - sounds well dodgy.

	let statementObj = str.startsWith('@media ') ? { type: 'media', len: 7 } : str.startsWith('@support ') ? { type: 'support', len: 9 } : false;
	if (!statementObj) {
		_warn(str + ' statement not recognised as an ACSS conditional');
		return false;
	}

	str = str.slice(statementObj.len).trim();

	let medQName = mediaQueriesOrig[str];
	if (medQName !== undefined) {
		if (conditionals[medQName] === undefined) {
			conditionals[medQName] = [];
			conditionals[medQName].push({ name: 'mql-true', value: medQName, query: str, type: statementObj.type });
		}
		return medQName;	// Return the name of the already existing media query.
	}
	// It doesn't already exist, set up new references and the media query event listener.
	// Set up name of media query in an array for quick referencing later. It will store the current state of the media query.
	let leng = mediaQueries.length + 1;
	let mqlName = '__mql_' + leng;
	// Set up an array element with the media query referencing the name of the variable that will store the current value of the media query.
	// We do this so we don't have to keep running matches each time. It will just return a boolean from the array in real time.
	// We won't have the name of the internal reference used in the selector, and we will need this each time the event listener happens, so create a reference.
	mediaQueriesOrig[str] = mqlName;
	// Set up the conditional statement in the config.
	conditionals[mqlName] = [];
	conditionals[mqlName].push({ name: 'mql-true', value: mqlName, query: str, type: statementObj.type });
	mediaQueries.push(mqlName);
	mediaQueries[mqlName] = {};

	let res;
	if (statementObj.type == 'media') {
		// Set up the variable which stores the event listener and state of the resulting query.
		let ev = window.matchMedia(str);
		res = ev.matches;
		// Set up the event listener and function for @media, as the result can dynamically change.
		ev.addListener(function(e) {
			// When the media query state changes, set the internal pointer to true or false.
			let mqlName = mediaQueriesOrig[e.media];
			mediaQueries[mqlName].val = e.matches;
		});
	} else {
		// Handle @support. If it gets this far, then it will only be @support here. It doesn't need an event listener outside the event selector.
		res = _checkSupport(str);
	}
	mediaQueries[mqlName].val = res;

	// Return the name of the media query reference to place into the primary selector.
	return mqlName;
};

const _setupPassive = () => {
	// Does this browser support passive events?
	try {
		let opts = Object.defineProperty({}, 'passive', {
			get: function() {
			doesPassive = true;
		}});
		window.addEventListener('testPassive', null, opts);
		window.removeEventListener('testPassive', null, opts);
	} catch (e) {}
};

const _sortOutEscapeChars = (str) => {
	let mapObj = {
		_ACSS_brace_start: '{',
		_ACSS_brace_end: '}',
		_ACSS_escaped_quote: '\\"',
		_ACSS_semi_colon: ';',
		_ACSS_colon: ':',
		_ACSS_slash: '/',
		_ACSS_at: '@',
		_ACSS_subst_equal_brace_start: '{=',
		_ACSS_subst_equal_brace_end: '=}',
		_ACSS_subst_dollar_brace_start: '{$',
		_ACSS_subst_brace_start: '{',
		_ACSS_subst_at_brace_start: '{@',
		_ACSS_subst_pipe_brace_start: '{|',
		_ACSS_subst_hash_brace_start: '{#',
		_ACSS_subst_brace_end: '}',
		_ACSS_dot: '.'
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};

const _startMainListen = () => {
	// Set up the back and forward buttons so they call the last proper page and don't change anything in the browser history.
	// Only do this once when the page loads, and only if the user hasn't set up a specific handling in the config.
	window.addEventListener('message', function(e) {
		if (e.origin !== window.location.origin || e.data.source == 'causejs-devtools-extension') return;
		var m = e.data;
		switch (m.type) {
			case 'activecss-unloading':
			case 'activecss-loaded':
				// Run an unloading or a loaded event through the config for the iframe.
				let el = document.getElementById(m.el);
				_handleEvents({ obj: el, evType: typ });
				break;
		}
	});

	// Create the routing node. We need a real but invisible DOM route so we can trigger a valid click for SPAing.
	let templ = document.createElement('template');
	templ.id = 'data-acss-route';
	templ.insertAdjacentHTML('beforeend', '<acss-router>');		// We do this here so we don't have to check for a child before removing it - it'll be faster in the nav.
	document.body.appendChild(templ);

	if (!document.parentNode) {
		window.addEventListener('popstate', function(e) {
			_handleSpaPop(e);
		});
	} else {
		// If this is an iframe, we are going to send an src change message to the parent whenever the iframe changes
		// page, so we can get an unload event on the parent iframe.
		window.addEventListener('beforeunload', function(e) {
			// Don't clash names with a native DOM event.
			parent.postMessage({ 'type': 'activecss-unloading', 'el': window.frameElement.id}, window.location.origin);
		});
		// CJS has finished loading, set message to parent saying the page has loaded.
		parent.postMessage({ 'type': 'activecss-loaded', 'el': window.frameElement.id}, window.location.origin);
	}

	// Get and set the page we are starting on.
	currentPage = location.pathname;

	// Bring in any session or local storage variables before we start observing for variable changes.
	_restoreStorage();

	// Set up listening for changes to scoped variables.
	scopedProxy = _observableSlim.create(scopedOrig, true, ActiveCSS._varUpdateDom);	// batch changes.
};

const _wrapUpStart = (o) => {
	// The page has been reloaded. Every page in Active CSS must have an element that contains an href linking to it, which when clicked on will perform the
	// actions necessary to redraw the page. The page has just been loaded or reloaded, so there was no object clicked on to perform any actions yet.
	// So we need to find the href in the page that has the url, and based on that, we assume that clicking on this object will perform the correct actions
	// to redraw the page when necessary.

	if (!setupEnded) {
		if (document.readyState && document.readyState != 'complete') {
			// Initial document loading not completely ready, come back to this in 20ms.
			setTimeout(_wrapUpStart, 20);
			return;
		}

		// Set up any custom action commands or conditionals. These can be run everywhere - they are not isolated to components.
		_handleEvents({ obj: '~_acssSystem', evType: 'init' });

		// DOM cleanup observer. Initialise it before any config events.
		elementObserver = new MutationObserver(ActiveCSS._nodeMutations);
		elementObserver.observe(document.body, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true
		});

		setupEnded = true;

		// Handle any developer initialization events
		_handleEvents({ obj: 'body', evType: 'preInit' });

		_handleEvents({ obj: 'body', evType: 'init' });

		// Now run the loaded events for each embedded Active CSS tag on the page. They were added all at once for speed.
		if (inlineIDArr.length > 0) _runInlineLoaded();

		// Iterate items on this page and do any draw events. Note this needs to be here, because the page has already been drawn and so the draw event
		// in the mutation section will never get run.
		_runInnerEvent(null, '*:not(template *)', 'draw', document, true);

		// Iterate document items on this page and do any observe events.
		// Note this needs to be here, because the document elements that are not components have already been drawn and so the observe
		// event in the mutation section would otherwise not get run.
		_runInnerEvent(null, '*:not(template *)', 'observe', document, true);

		// Iterate document level custom selectors that use the observe event and run any of those that pass the conditionals.
		_handleObserveEvents(null, document, true);

		_handleEvents({ obj: 'body', evType: 'scroll' });	// Handle any immediate scroll actions on the body if any present. Necessary when refreshing a page.

		if (!inIframe) {
			_handleSpaPop({}, true);	// true = initialize.
		}

		document.dispatchEvent(new CustomEvent('ActiveCSSInitialized', {}));

		// Lazy load config.
		if (lazyConfig !== '') {
			setTimeout(function() {
				let arr = lazyConfig.split(','), configFile;
				for (configFile of arr) {
					_a.LoadConfig({ actName: 'load-config', actVal: configFile, doc: document});	// load-config param updates the panel.
				}
			}, 1000);
		}
	} else {
		// Now run the loaded events for each embedded Active CSS tag on the page.
		if (inlineIDArr.length > 0) {
			_runInlineLoaded();
		}
	}

	if (concatConfigCo > concatConfigLen) {
		if (o.actName == 'load-config') {
			configArr.push(o.avRaw);	// Add the file without anything after and including the "?".
			// Handle updating the extensions. Either or not of them could be showing, so they either get an immediate update, or a flag is set for them to
			// update if they received the onShown event. Similar to the config update to the Panel whenever an element is edited in Elements.
			// It's slightly different in that we need the additional optional step of the immediate update instead of the onShown triggered update, plus
			// we need to update both Elements and Panel here, and not only the Panel as in the case of the edited element in Elements.
			if (setupEnded) {
				// Send a message to the extensions to update the config display. This goes to both extensions.
				if (debuggerActive) {
					_tellPanelToUpdate();
				}
				if (evEditorActive) {
					_tellElementsToUpdate();
				}
			}
			_handleEvents({ obj: 'body', evType: 'afterLoadConfig', eve: o.e });
			_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		}
	}
};

const _addCSSToBody = (css, tagRef, toBody) => {
	// Adds to a body based on the ref, otherwise adds to the existing style tag.
	let tagIfThere = document.querySelector('style[data-from-acss="' + tagRef + '"]');		// Note: tagRef is a predictable string - so this is fine.
	if (tagIfThere) {
		// Append to existing style tag.
		tagIfThere.cssText = tagIfThere.cssText + css;
	} else {
		// Create new tag.
		let tag = document.createElement('style');
		tag.type = 'text/css';
		tag.setAttribute('data-from-acss', tagRef);
		tag.appendChild(document.createTextNode(css));
		// Append to the bottom of the headers.
		document.head.append(tag);
	}
};

const _cssExtractAddTags = fileRef => {
	// fileRef will be populated if embedded or empty if from loaded config.
	let tagRef = _cssExtractGetRef(fileRef);

	// No need to do anything if there isn't any CSS for extraction from the ACSS config.
	if (extractedCSS[tagRef] !== undefined && extractedCSS[tagRef] !== '') {
		// Add CSS to the end of the body. If the tag is already there, in the case of "permanent" loaded config, it will add it to the existing tag.
		_addCSSToBody(extractedCSS[tagRef], tagRef);
	}
	// Delete the CSS from memory now that it is added to the DOM. There's no reason it needs to stick around and we don't want to add it more than once.
	// The embedded CSS style tag that has been created here will get cleaned up in _regenConfig if it came from a removed embedded ACSS tag.
	delete extractedCSS[tagRef];

	// If there are any CSS tags left to output, do that. These will be from embedded ACSS tags if anything is run here.
	let i;
	for (i in extractedCSS) {
		// Put at the bottom of the headers. Extracted CSS tags in an SPA will always be placed into the DOM before the new inner content is drawn
		// and it keeps the body content cleaner.
		if (extractedCSS[i] !== undefined && extractedCSS[i] !== '') {
			_addCSSToBody(extractedCSS[i], i);
		}
		delete extractedCSS[i];
	}
};

const _cssExtractConcat = cssObj => {
	let { file, statement, selector, commands } = cssObj;
	let tagRef = _cssExtractGetRef(file);

	// If this tag existed but doesn't any more then it shouldn't be re-added - it's a tag that's been removed pending fully clean-up.
	if (extractedCSS[tagRef] === undefined) return;

	// Start working with the CSS object and add results to the current tag string placeholder. Make it pretty so it's readable in DevTools.
	// Handle any initial at-rule first. As far as I know, nested query-type at-rules are not allowed in CSS, so this works with that.
	// If that nested rule changes at some point, then all this will need to be updated.
	let cssString = '', mqlUsed;
	if (statement && statement.startsWith('__mql_') && conditionals[statement] !== undefined) {
		cssString += '@' + conditionals[statement][0].type + ' ' + conditionals[statement][0].query + ' {\n';
		mqlUsed = true;
	}
	let outerTabStr = mqlUsed ? '  ' : '';
	cssString += outerTabStr + selector + ' {\n';

	// Iterate commands object and compile string. We can only do this after initial parsing, which is a bit irritating but there may be a better way.
	let nestedCo = 0;	// monitors how many space tabs we need for indenting once we are inside the initial indent.
	const iter = commandsObj => {
		nestedCo++;
    	let res = '';
    	Object.keys(commandsObj).forEach(function (k) {
    		if (typeof commandsObj[k] === 'object') {
    			if (!commandsObj[k].value) {
    				console.log();
    				return;
    			}
	        	if (typeof commandsObj[k].value == 'object') {
		        	let isString;
					if (typeof commandsObj[k].name == 'string') {
						res += outerTabStr + '  '.repeat(nestedCo) + commandsObj[k].name + ' {\n';
						isString = true;
		            }
		            res += iter(commandsObj[k].value);
					if (isString) res += outerTabStr + '  '.repeat(nestedCo) + '}\n';
		            return;
	        	}
				res += outerTabStr + '  '.repeat(nestedCo) + commandsObj[k].name + ': ' + commandsObj[k].value + ';\n';
	        }
	    });
		nestedCo--;
	    return res;
	};
	cssString += iter(commands) + outerTabStr + '}\n';
	if (mqlUsed) {
		cssString += '}\n';
	}

	extractedCSS[tagRef] += cssString;
};

const _cssExtractGetRef = (fileRef) => {
	// If fileRef is empty, it's definitely come from loaded config and not embedded - it's optional - for speed.
	// Return the extracted CSS stylesheet reference. This will be placed into the data-css-ref attribute when the stylesheet gets inserted onto the page.
	// It's done like this and not via any other internal method is so that the CSS can be tweaked using DevTools.
	// If fileRef.startsWith('_inline_'):
		// This is a CSS extraction from an embedded ACSS style tag. One stylesheet is generated per tag so it can be removed if necessary.
		// It will look like '_acss_css_inline_nnn' (where "nnn" is a number).
	// otherwise:
		// This is a CSS extraction from loaded config. Loaded config CSS gets accumulatively appended to a single stylesheet in the order it is loaded.
		// 
	
	if (fileRef && fileRef.startsWith('_inline_')) {
		return fileRef;
	} else {
		return 'permanent';
	}
};

const _cssExtractInit = (fileRef) => {
	let tagRef = _cssExtractGetRef(fileRef);
	if (tagRef != 'permanent' && extractedCSS[tagRef] !== undefined) {
		_err('Internal reference for CSS extraction (' + tagRef + ') already exists.', null, 'extractedCSS[tagRef]:', extractedCSS[tagRef]);
	}
	extractedCSS[tagRef] = '';
};

const cssExtractRemoveTag = tagRef => {
	// This is only used for removing CSS extracted from embedded ACSS style tags.
	let cssTag = document.querySelector('style[data-from-acss="' + tagRef + '"]');
	if (cssTag) cssTag.parentNode.removeChild(cssTag);
};

ActiveCSS.init = (config) => {
	config = config || {};
	passiveEvents = (config.passiveEvents === undefined) ? true : config.passiveEvents;
	let inlineConfigTags = document.querySelectorAll('*:not(template) style[type="text/acss"]');
	if (autoStartInit) {
		if (inlineConfigTags) {
			// This only runs if there is no user config later in the page within the same call stack. If the Active CSS initialization is timed out until later on,
			// then obviously the initialization events will not run.
			lazyConfig = '';
			initInlineLoading = true;
			_getInline(inlineConfigTags);
			initInlineLoading = false;
			_readSiteMap();
		}
		autoStartInit = false;
	} else {
		userSetupStarted = true;
		if (setupEnded) {
			console.log('Cannot initialize Active CSS twice.');
			return;
		}
		lazyConfig = config.lazyConfig || '';
		config.configLocation = config.configLocation || console.log('No embedded or Active CSS config file setup - see installation docs.');
		if (config.debugMode) {
			debugMode = config.debugMode;
			if (document.parentNode) {
				console.log('Active CSS debug mode in iframe ID ' + window.frameElement.id + ': ' + debugMode);
			} else {
				console.log('Active CSS debug mode: ' + debugMode);
			}
		}
		let thisFile;
		let configArrTmp = config.configLocation.split(',');
		concatConfigLen = configArrTmp.length;

		if (inlineConfigTags) {
			initInlineLoading = true;
			_getInline(inlineConfigTags);
			initInlineLoading = false;
		}
		for (thisFile of configArrTmp) {
			thisFile = thisFile.trim();
			configArr.push(_getBaseURL(thisFile));	// Build up the initial config list without anything after and including the "?".
			_getFile(thisFile, 'txt', { file: thisFile });
		}
	}
};

const _immediateStop = o => {
	// Stop event flow here. Used in pause/await functionality for breaking out of commands at the start of the timeout.
	// It also performs everything that is needed for the command "exit;" to work, as it effectively stops further all event flow actions.
	if (typeof imSt[o._imStCo] !== 'undefined') imSt[o._imStCo]._acssImmediateStop = true;
	_stopImmediateEventPropagation(o);	// Also calls _stopEventPropagation().
};

const _isSyncQueueSet = (val) => {
	return !!syncQueue[val];
};

const _pause = (o, tim) => {
	_setResumeObj(o);
	let restartObj = _clone(o);
	setTimeout(() => {
		o = null;
		_syncRestart(restartObj, restartObj._subEvCo);
		restartObj = null;
		return;
	}, tim);
};

const _pauseHandler = (o) => {
	if (o.actVal.indexOf('every') !== -1 || o.actVal.indexOf('after') !== -1 || o.actVal.indexOf('await') !== -1) {
		_warn('Delay options ("after", "every", "await") are not allowed in the ' + o.actName + ' command, skipping', o);
		_nextFunc(o);
		return;
	} else {
		let convTime = _convertToMS(o.actVal, 'Invalid delay number format: ' + o.actVal);
		// This is a hack due to the way the event stack works. The first pause is completed on all target selectors in a set before they all finish.
		// This effectively multiplies the pause times by the number of elements in the target selector set.
		// Dividing by the number of elements in the target selector set gives us the valid time to pause for. It's cheeky and should probably be
		// worked out a different way, but it works.
		let newConvTime = (o._elsTotal) ? convTime / o._elsTotal : convTime;
		if (convTime) {
			_immediateStop(o);
			_pause(o, newConvTime);
		}
	}
};

const _setResumeObj = o => {
	syncQueue[o._subEvCo] = {
		ref_subEvCo: o._subEvCo,
		intID: o.intID,
		secSelObj: o.secSelObj,
		loopRef: o.loopRef
	};
};

const _syncCheckAndSet = (o, syncQueueSet) => {
	// If there isn't a sync option on the command, skip it.
	if (!o.actVal.endsWith(' await')) return;

	// Remove the " await" from action command.
	o.actVal = o.actVal.slice(0, -6).trim();

	// Only sync this command if it's a valid delayed event, otherwise ignore the sync.
	if (!o.isAsync && !o.isTimed) return;
	// Set the sync queue up for remaining action commands to be added.

	// We are awaiting here. Set the resumption object so we can remember where to resume from later.
	_setResumeObj(o);
	_immediateStop(o);

	// No return value is needed as objects are passed into functions by reference.
};

const _syncEmpty = val => {
	// Wipe this sync queue. The "i" is needed at the beginning of each key in order to get the delete working correctly. Otherwise you'll get a memory leak.
	// But it's super fast this way.
	delete syncQueue[val];
};

const _syncRestart = (o, resumeID) => {
	if (_isSyncQueueSet(resumeID)) {
		let loopObjCopy = _clone(o.origLoopObj);
		let thisQueue = _clone(syncQueue[o._subEvCo]);
		loopObjCopy.origLoopObj = loopObjCopy;
		loopObjCopy.origLoopObj.resume = true;
		loopObjCopy.origLoopObj.resumeProps = thisQueue;

		// Re-run the events. It needs a setTimeout in order to clear the memory stack on the way back up the event flow.
		// It also serves a purpose in keeping simultaneous actions happening at roughly the same time.
		setTimeout(_performEvent(loopObjCopy), 0);
	}
};

const _syncStore = (o, delayActiveID, syncQueueSet, runButElNotThere) => {
	if (o.origLoopObj && o.origLoopObj.resume) {
		let checkObj = o.origLoopObj.resumeProps;

		// Check if we have reached the new action command that we need to resume from. We won't run this one, but we'll start from the action command after this.
		if (syncQueue[checkObj.ref_subEvCo] &&
				checkObj.intID == o.intID &&
				(typeof o.secSel == 'string' && o.secSel.startsWith('~') || checkObj.secSelObj.isSameNode(o.secSelObj)) &&
				checkObj.loopRef == o.loopRef) {

			// Don't run this command but let it run the next time.
			_syncEmpty(checkObj.ref_subEvCo);
			// This is not needed for the flow but makes things faster:
			delete o.origLoopObj;
			return true;
		}
	}

	// If we need to skip this action command altogether, return true.
	if (!delayActiveID && syncQueueSet) return true;
};

// Store the rendered location of the attribute for quick DOM lookup when state changes. It doesn't have wrapping comments so it needs an extra reference location.
// This doesn't do a set-attribute. This is done before the attribute is set.
const _addScopedAttr = (wot, o, originalStr, walker, scopeRef) => {
	let cid = _addScopedCID(wot, o.secSelObj, scopeRef);
	let attrName = o.actVal.split(' ')[0];
	let str = (!walker) ? originalStr.substr(originalStr.indexOf(' ') + 1)._ACSSRepQuo() : originalStr;
	_set(scopedData, wot + '.attrs["' + cid + '"]["' + attrName + '"]', { orig: str, scopeRef });
};

// Store the rendered location for quick DOM lookup when state changes. We need this for both content and attribute rendering.
const _addScopedCID = (wot, obj, scopeRef) => {
	let cid = _getActiveID(obj);
	if (typeof _get(scopedData, wot) === 'undefined') {
		_set(scopedData, wot, []);
	}
	return cid;
};

/* Takes the base name of a fully scoped variable and sets it as allowable to be resolved for evaluating the inner brackets of variables. */
const _allowResolve = fullVar => {
	if (fullVar.startsWith('window.')) return;	// Don't bother remembering window variables, they will always be resolved.
	// Any scopedProxy reference has been stripped off, so remove the base scope (main., _1., session., etc.) and store the base variable name before any dot or bracket.
	let scopedVar = fullVar.substr(fullVar.indexOf('.') + 1);
	let baseVar = _getBaseVar(scopedVar);
	// Add the resolvable variable to the list if it isn't there already.
	if (resolvableVars.indexOf(baseVar) === -1) resolvableVars[baseVar] = true;
};

const _escapeItem = (str='', varName=null) => {
	// This is for putting content directly into html. It needs to be in string format and may not come in as such.
	if (varName && varName.substr(0, 1) == '$' && varName !== '$HTML_ESCAPED') return str;		// Don't escape html variables.
	let div = document.createElement('div');
	// Remove possibility of JavaScript evaluation later on in a random place.
	div.textContent = ('' + str).replace(/\{\=|\=\}/gm, '');
	return div.innerHTML;
};

const _getBaseVar = str => {
	let dotPos = str.indexOf('.');
	let bracketPos = str.indexOf('[');
	if (dotPos !== -1 && dotPos < bracketPos) {
		// Handle a dot appearing earlier than a bracket.
		return str.substr(0, dotPos);
	} else if (bracketPos !== -1) {
		// Handle a bracket which is now before a dot.
		return str.substr(0, bracketPos);
	} else {
		// Take the whole thing - there is no dot or bracket.
		return str;
	}
};

const _getScopedVar = (nam, scope=false) => {
	// Accepts any variable type, scoped or not. Returns an object containing full scope name (fullName), name (name) and value (val).
	// If variable is already scoped, it assumes that inheritance has already been sorted out.
	let fullName, scopeName, val, pathName, scopingDone, winVar = false;

	let fullyScoped = (nam.startsWith('window.') || nam.startsWith('scopedProxy.'));

	if (scope == '___none' && !fullyScoped) {
		fullName = 'scopedProxy.' + nam;
		scopeName = nam;
		val = _get(scopedProxy.__getTarget, scopeName);
	} else if (fullyScoped) {
		fullName = nam;
		scopeName = nam.substr(nam.indexOf('.') + 1);
		if (scope) scopeName = _resolveInnerBracketVars(scopeName, scope);
		if (fullName.substr(0, 1) == 'w') {
			val = _get(window, scopeName);
			winVar = true;
		} else {
			val = _get(scopedProxy.__getTarget, scopeName);
		}
	} else {
		// Handle variables without a scope.
		scopeName = _resolveInnerBracketVars(nam, scope);
		scopeName = ((scope && privVarScopes[scope]) ? scope : 'main') + '.' + scopeName;
		let scopedObj = _resolveInheritance(scopeName);
		scopeName = scopedObj.name;
		fullName = 'scopedProxy.' + scopeName;
		val = scopedObj.val;
	}

	return { fullName, name: scopeName, val, winVar };
};

const _handleVars = (arr, opts, varReplacementRef=null) => {
	let { evType, func, o, obj, secSelObj, shadowParent, str, varScope } = opts, i = 0;
	if (!varReplacementRef) varReplacementRef = varReplaceRef++;
	for (i; i < arr.length; i++) {
		if (!arr[i]) continue;	// cater for null values due to populating _handleVars arr conditionally.
		switch (arr[i]) {
			case 'attrs':
				// Includes progressive variable substitution protection.
				str = _replaceAttrs(obj, str, secSelObj, o, func, varScope, evType, varReplacementRef);
				break;

			case 'expr':
				// Includes progressive variable substitution protection.
				str = _replaceJSExpression(str, null, null, varScope, varReplacementRef);
				break;

			case 'html':
				// Includes progressive variable substitution protection.
				str = _replaceHTMLVars(o, str, varReplacementRef);
				break;

			case 'rand':
				// No need for progressive substitution protection.
				str = _replaceRand(str);
				break;

			case 'scoped':
				// Includes progressive variable substitution protection.
				str = _replaceScopedVars(str, secSelObj, func, o, null, shadowParent, varScope, varReplacementRef);
				break;

			case 'strings':
				// Includes progressive variable substitution protection.
				str = _replaceStringVars(o, str, varScope, varReplacementRef);

		}
	}
	return { str, ref: varReplacementRef };
};

/*
 * 	Observable Slim
 *	Version 0.1.5
 * 	https://github.com/elliotnb/observable-slim
 *
 * 	Licensed under the MIT license:
 * 	http://www.opensource.org/licenses/MIT
 *
 *	Observable Slim is a singleton that allows you to observe changes made to an object and any nested
 *	children of that object. It is intended to assist with one-way data binding, that is, in MVC parlance,
 *	reflecting changes in the model to the view. Observable Slim aspires to be as lightweight and easily
 *	understood as possible. Minifies down to roughly 3000 characters.
 *
 *	Change: 29 Jan 2020, main function name change to fit into Active CSS conventions. Fixed syntax so it passes jshint. Used in data-binding.
 *	Some public functions have been commented out as we don't need all of it.
 *
 */
const _observableSlim = (function() {
	var paths = [];
	// An array that stores all of the observables created through the public create() method below.
	var observables = [];
	// An array of all the objects that we have assigned Proxies to
	var targets = [];

	// An array of arrays containing the Proxies created for each target object. targetsProxy is index-matched with
	// 'targets' -- together, the pair offer a Hash table where the key is not a string nor number, but the actual target object
	var targetsProxy = [];

	// this variable tracks duplicate proxies assigned to the same target.
	// the 'set' handler below will trigger the same change on all other Proxies tracking the same target.
	// however, in order to avoid an infinite loop of Proxies triggering and re-triggering one another, we use dupProxy
	// to track that a given Proxy was modified from the 'set' handler
	var dupProxy = null;

	var _getProperty = function(obj, path) {
		return path.split('.').reduce(function(prev, curr) {
			return prev ? prev[curr] : undefined;
		}, obj || self);
	};

	/*	Function: _create
				Private internal function that is invoked to create a new ES6 Proxy whose changes we can observe through
				the Observerable.observe() method.
			Parameters:
				target 				- required, plain JavaScript object that we want to observe for changes.
				domDelay 			- batch up changes on a 10ms delay so a series of changes can be processed in one DOM update.
				originalObservable 	- object, the original observable created by the user, exists for recursion purposes,
									  allows one observable to observe change on any nested/child objects.
				originalPath 		- array of objects, each object having the properties 'target' and 'property' -- target referring to the observed object itself
									  and property referring to the name of that object in the nested structure. the path of the property in relation to the target 
									  on the original observable, exists for recursion purposes, allows one observable to observe change on any nested/child objects. 
			Returns:
				An ES6 Proxy object.
	*/
	var _create = function(target, domDelay, originalObservable, originalPath) {

		var observable = originalObservable || null;
		
		// record the nested path taken to access this object -- if there was no path then we provide the first empty entry
		var path = originalPath || [{"target":target,"property":""}];
		paths.push(path);
		
		// in order to accurately report the "previous value" of the "length" property on an Array
		// we must use a helper property because intercepting a length change is not always possible as of 8/13/2018 in 
		// Chrome -- the new `length` value is already set by the time the `set` handler is invoked
		if (target instanceof Array) target.__length = target.length;
		
		var changes = [];

		/*	Function: _getPath
				Returns a string of the nested path (in relation to the top-level observed object)
				of the property being modified or deleted.
			Parameters:
				target - the object whose property is being modified or deleted.
				property - the string name of the property
				jsonPointer - optional, set to true if the string path should be formatted as a JSON pointer.
			Returns:
				String of the nested path (e.g., hello.testing.1.bar or, if JSON pointer, /hello/testing/1/bar
		*/
		var _getPath = function(target, property, jsonPointer) {
		
			var fullPath = "";
			var lastTarget = null;
			
			// loop over each item in the path and append it to full path
			for (var i = 0; i < path.length; i++) {
				
				// if the current object was a member of an array, it's possible that the array was at one point
				// mutated and would cause the position of the current object in that array to change. we perform an indexOf
				// lookup here to determine the current position of that object in the array before we add it to fullPath
				if (lastTarget instanceof Array && !isNaN(path[i].property)) {
					path[i].property = lastTarget.indexOf(path[i].target);
				}
				
				fullPath = fullPath + "." + path[i].property;
				lastTarget = path[i].target;
			}
			
			// add the current property
			fullPath = fullPath + "." + property;
			
			// remove the beginning two dots -- ..foo.bar becomes foo.bar (the first item in the nested chain doesn't have a property name)
			fullPath = fullPath.substring(2);
			
			if (jsonPointer === true) fullPath = "/" + fullPath.replace(/\./g, "/");

			return fullPath;
		};

		var _notifyObservers = function(numChanges) {

			// if the observable is paused, then we don't want to execute any of the observer functions
			if (observable.paused === true) return;

			// execute observer functions on a 10ms settimeout, this prevents the observer functions from being executed
			// separately on every change -- this is necessary because the observer functions will often trigger UI updates
 			if (domDelay === true) {
				setTimeout(function() {
					if (numChanges === changes.length) {

						// we create a copy of changes before passing it to the observer functions because even if the observer function
						// throws an error, we still need to ensure that changes is reset to an empty array so that old changes don't persist
						var changesCopy = changes.slice(0);
						changes = [];

						// invoke any functions that are observing changes
						for (var i = 0; i < observable.observers.length; i++) observable.observers[i](changesCopy);

					}
				},10);
			} else {

				// we create a copy of changes before passing it to the observer functions because even if the observer function
				// throws an error, we still need to ensure that changes is reset to an empty array so that old changes don't persist
				var changesCopy = changes.slice(0);
				changes = [];

				// invoke any functions that are observing changes
				for (var i = 0; i < observable.observers.length; i++) observable.observers[i](changesCopy);

			}
		};

		var handler = {
			get: function(target, property) {

				// implement a simple check for whether or not the object is a proxy, this helps the .create() method avoid
				// creating Proxies of Proxies.
				if (property === "__getTarget") {
					return target;
				} else if (property === "__isProxy") {
					return true;
				// from the perspective of a given observable on a parent object, return the parent object of the given nested object
				} else if (property === "__getParent") {
					return function(i=1) {
						var parentPath = _getPath(target, "__getParent").split(".");
						parentPath.splice(-(i+1),(i+1));
						return _getProperty(observable.parentProxy, parentPath.join("."));
					};
				// return the full path of the current object relative to the parent observable
				} else if (property === "__getPath") {
					// strip off the 12 characters for ".__getParent"
					var parentPath = _getPath(target, "__getParent");
					return parentPath.slice(0, -12);
				}

				// for performance improvements, we assign this to a variable so we do not have to lookup the property value again
				var targetProp = target[property];
				if (target instanceof Date && targetProp instanceof Function && targetProp !== null) {
					return targetProp.bind(target);
				}

				// if we are traversing into a new object, then we want to record path to that object and return a new observable.
				// recursively returning a new observable allows us a single Observable.observe() to monitor all changes on
				// the target object and any objects nested within.
				if (targetProp instanceof Object && targetProp !== null && target.hasOwnProperty(property)) {

					// if we've found a proxy nested on the object, then we want to retrieve the original object behind that proxy
					if (targetProp.__isProxy === true) targetProp = targetProp.__getTarget;
					
					// if the object accessed by the user (targetProp) already has a __targetPosition AND the object
					// stored at target[targetProp.__targetPosition] is not null, then that means we are already observing this object
					// we might be able to return a proxy that we've already created for the object
					if (targetProp.__targetPosition > -1 && targets[targetProp.__targetPosition] !== null) {
						
						// loop over the proxies that we've created for this object
						var ttp = targetsProxy[targetProp.__targetPosition];
						for (var i = 0, l = ttp.length; i < l; i++) {
							
							// if we find a proxy that was setup for this particular observable, then return that proxy
							if (observable === ttp[i].observable) {
								return ttp[i].proxy;
							}
						}
					}

					// if we're arrived here, then that means there is no proxy for the object the user just accessed, so we
					// have to create a new proxy for it

					// create a shallow copy of the path array -- if we didn't create a shallow copy then all nested objects would share the same path array and the path wouldn't be accurate
					var newPath = path.slice(0);
					newPath.push({"target":targetProp,"property":property});
					return _create(targetProp, domDelay, observable, newPath);
				} else {
					return targetProp;
				}
			},
 			deleteProperty: function(target, property) {

				// was this change an original change or was it a change that was re-triggered below
				var originalChange = true;
				if (dupProxy === proxy) {
					originalChange = false;
					dupProxy = null;
				}

				// in order to report what the previous value was, we must make a copy of it before it is deleted
				var previousValue = Object.assign({}, target);

				// record the deletion that just took place
				changes.push({
					"type":"delete",
					"target":target,
					"property":property,
					"newValue":null,
					"previousValue":previousValue[property],
					"currentPath":_getPath(target, property),
					"jsonPointer":_getPath(target, property, true),
					"proxy":proxy
				});

				if (originalChange === true) {

					// perform the delete that we've trapped if changes are not paused for this observable
					if (!observable.changesPaused) delete target[property];
				
					for (var a = 0, l = targets.length; a < l; a++) if (target === targets[a]) break;

					// loop over each proxy and see if the target for this change has any other proxies
					var currentTargetProxy = targetsProxy[a] || [];

					var b = currentTargetProxy.length;
					while (b--) {
						// if the same target has a different proxy
						if (currentTargetProxy[b].proxy !== proxy) {
							// !!IMPORTANT!! store the proxy as a duplicate proxy (dupProxy) -- this will adjust the behavior above appropriately (that is,
							// prevent a change on dupProxy from re-triggering the same change on other proxies)
							dupProxy = currentTargetProxy[b].proxy;

							// make the same delete on the different proxy for the same target object. it is important that we make this change *after* we invoke the same change
							// on any other proxies so that the previousValue can show up correct for the other proxies
							delete currentTargetProxy[b].proxy[property];
						}
					}

				}

				_notifyObservers(changes.length);

				return true;

			},
			set: function(target, property, value, receiver) {
				
				// if the value we're assigning is an object, then we want to ensure
				// that we're assigning the original object, not the proxy, in order to avoid mixing
				// the actual targets and proxies -- creates issues with path logging if we don't do this
				if (value && value.__isProxy) value = value.__getTarget;
			
				// was this change an original change or was it a change that was re-triggered below
				var originalChange = true;
				if (dupProxy === proxy) {
					originalChange = false;
					dupProxy = null;
				}

				// improve performance by saving direct references to the property
				var targetProp = target[property];

				// Only record this change if:
				// 	1. the new value differs from the old one 
				//	2. OR if this proxy was not the original proxy to receive the change
				// 	3. OR the modified target is an array and the modified property is "length" and our helper property __length indicates that the array length has changed
				//
				// Regarding #3 above: mutations of arrays via .push or .splice actually modify the .length before the set handler is invoked
				// so in order to accurately report the correct previousValue for the .length, we have to use a helper property.
				if (targetProp !== value || originalChange === false || (property === "length" && target instanceof Array && target.__length !== value)) {

					var foundObservable = true;

					var typeOfTargetProp = (typeof targetProp);

					// determine if we're adding something new or modifying somethat that already existed
					var type = "update";
					if (typeOfTargetProp === "undefined") type = "add";

					// store the change that just occurred. it is important that we store the change before invoking the other proxies so that the previousValue is correct
					changes.push({
						"type":type,
						"target":target,
						"property":property,
						"newValue":value,
						"previousValue":receiver[property],
						"currentPath":_getPath(target, property),
						"jsonPointer":_getPath(target, property, true),
						"proxy":proxy
					});
					
					// mutations of arrays via .push or .splice actually modify the .length before the set handler is invoked
					// so in order to accurately report the correct previousValue for the .length, we have to use a helper property.
					if (property === "length" && target instanceof Array && target.__length !== value) {
						changes[changes.length-1].previousValue = target.__length;
						target.__length = value;
					}

					// !!IMPORTANT!! if this proxy was the first proxy to receive the change, then we need to go check and see
					// if there are other proxies for the same project. if there are, then we will modify those proxies as well so the other
					// observers can be modified of the change that has occurred.
					if (originalChange === true) {

						// because the value actually differs than the previous value
						// we need to store the new value on the original target object,
						// but only as long as changes have not been paused
						if (!observable.changesPaused) target[property] = value;


						foundObservable = false;
						
						var targetPosition = target.__targetPosition;
						var z = targetsProxy[targetPosition].length;
						
						// find the parent target for this observable -- if the target for that observable has not been removed
						// from the targets array, then that means the observable is still active and we should notify the observers of this change
						while (z--) {
							if (observable === targetsProxy[targetPosition][z].observable) {
								if (targets[targetsProxy[targetPosition][z].observable.parentTarget.__targetPosition] !== null) {
									foundObservable = true;
									break;
								}
							}
						}

						// if we didn't find an observable for this proxy, then that means .remove(proxy) was likely invoked
						// so we no longer need to notify any observer function about the changes, but we still need to update the
						// value of the underlying original objectm see below: target[property] = value;
						if (foundObservable) {

							// loop over each proxy and see if the target for this change has any other proxies
							var currentTargetProxy = targetsProxy[targetPosition];
							for (var b = 0, l = currentTargetProxy.length; b < l; b++) {
								// if the same target has a different proxy
								if (currentTargetProxy[b].proxy !== proxy) {

									// !!IMPORTANT!! store the proxy as a duplicate proxy (dupProxy) -- this will adjust the behavior above appropriately (that is,
									// prevent a change on dupProxy from re-triggering the same change on other proxies)
									dupProxy = currentTargetProxy[b].proxy;

									// invoke the same change on the different proxy for the same target object. it is important that we make this change *after* we invoke the same change
									// on any other proxies so that the previousValue can show up correct for the other proxies
									currentTargetProxy[b].proxy[property] = value;

								}
							}

							// if the property being overwritten is an object, then that means this observable
							// will need to stop monitoring this object and any nested objects underneath the overwritten object else they'll become
							// orphaned and grow memory usage. we excute this on a setTimeout so that the clean-up process does not block
							// the UI rendering -- there's no need to execute the clean up immediately
							setTimeout(function() {
								
								if (typeOfTargetProp === "object" && targetProp !== null) {

									// check if the to-be-overwritten target property still exists on the target object
									// if it does still exist on the object, then we don't want to stop observing it. this resolves
									// an issue where array .sort() triggers objects to be overwritten, but instead of being overwritten
									// and discarded, they are shuffled to a new position in the array
									var keys = Object.keys(target);
									for (var i = 0, l = keys.length; i < l; i++) {
										if (target[keys[i]] === targetProp) return;
									}
									
									var stillExists = false;
									
									// now we perform the more expensive search recursively through the target object.
									// if we find the targetProp (that was just overwritten) still exists somewhere else
									// further down in the object, then we still need to observe the targetProp on this observable.
									(function iterate(target) {
										var keys = Object.keys(target);
										for (var i = 0, l = keys.length; i < l; i++) {
											
											var property = keys[i];
											var nestedTarget = target[property];
											
											if (nestedTarget instanceof Object && nestedTarget !== null) iterate(nestedTarget);
											if (nestedTarget === targetProp) {
												stillExists = true;
												return;
											}
										}
									})(target);
									
									// even though targetProp was overwritten, if it still exists somewhere else on the object,
									// then we don't want to remove the observable for that object (targetProp)
									if (stillExists === true) return;

									// loop over each property and recursively invoke the `iterate` function for any
									// objects nested on targetProp
									(function iterate(obj) {

										var keys = Object.keys(obj);
										for (i = 0, l = keys.length; i < l; i++) {
											var objProp = obj[keys[i]];
											if (objProp instanceof Object && objProp !== null) iterate(objProp);
										}

										// if there are any existing target objects (objects that we're already observing)...
										var c = -1;
										for (i = 0, l = targets.length; i < l; i++) {
											if (obj === targets[i]) {
												c = i;
												break;
											}
										}
										if (c > -1) {

											// ...then we want to determine if the observables for that object match our current observable
											var currentTargetProxy = targetsProxy[c];
											var d = currentTargetProxy.length;

											while (d--) {
												// if we do have an observable monitoring the object thats about to be overwritten
												// then we can remove that observable from the target object
												if (observable === currentTargetProxy[d].observable) {
													currentTargetProxy.splice(d,1);
													break;
												}
											}

											// if there are no more observables assigned to the target object, then we can remove
											// the target object altogether. this is necessary to prevent growing memory consumption particularly with large data sets
											if (currentTargetProxy.length == 0) {
												// targetsProxy.splice(c,1);
												targets[c] = null;
											}
										}

									})(targetProp);
								}
							},10000);
						}

						// TO DO: the next block of code resolves test case #29, but it results in poor IE11 performance with very large objects.
						// UPDATE: need to re-evaluate IE11 performance due to major performance overhaul from 12/23/2018.
						// 
						// if the value we've just set is an object, then we'll need to iterate over it in order to initialize the
						// observers/proxies on all nested children of the object
						/* if (value instanceof Object && value !== null) {
							(function iterate(proxy) {
								var target = proxy.__getTarget;
								var keys = Object.keys(target);
								for (var i = 0, l = keys.length; i < l; i++) {
									var property = keys[i];
									if (target[property] instanceof Object && target[property] !== null) iterate(proxy[property]);
								};
							})(proxy[property]);
						}; */

					}

					if (foundObservable) {
						// notify the observer functions that the target has been modified
						_notifyObservers(changes.length);
					}

				}
				return true;
			}
		};

		var __targetPosition = target.__targetPosition;
		if (!__targetPosition || __targetPosition < 0) { // original was = !(__targetPosition > -1)) {
			Object.defineProperty(target, "__targetPosition", {
				value: targets.length,
				writable: false,
				enumerable: false,
				configurable: false
			});
		}
		
		// create the proxy that we'll use to observe any changes
		var proxy = new Proxy(target, handler);

		// we don't want to create a new observable if this function was invoked recursively
		if (observable === null) {
			observable = {"parentTarget":target, "domDelay":domDelay, "parentProxy":proxy, "observers":[],"paused":false,"path":path,"changesPaused":false};
			observables.push(observable);
		}

		// store the proxy we've created so it isn't re-created unnecessairly via get handler
		var proxyItem = {"target":target,"proxy":proxy,"observable":observable};

		// if we have already created a Proxy for this target object then we add it to the corresponding array
		// on targetsProxy (targets and targetsProxy work together as a Hash table indexed by the actual target object).
		if (__targetPosition > -1) {
			
			// the targets array is set to null for the position of this particular object, then we know that
			// the observable was removed some point in time for this object -- so we need to set the reference again
			if (targets[__targetPosition] === null) {
				targets[__targetPosition] = target;
			}
			
			targetsProxy[__targetPosition].push(proxyItem);
			
		// else this is a target object that we had not yet created a Proxy for, so we must add it to targets,
		// and push a new array on to targetsProxy containing the new Proxy
		} else {
			targets.push(target);
			targetsProxy.push([proxyItem]);
		}

		return proxy;
	};

	return {
		/*	Method:
				Public method that is invoked to create a new ES6 Proxy whose changes we can observe
				through the Observerable.observe() method.
			Parameters
				target - Object, required, plain JavaScript object that we want to observe for changes.
				domDelay - Boolean, required, if true, then batch up changes on a 10ms delay so a series of changes can be processed in one DOM update.
				observer - Function, optional, will be invoked when a change is made to the proxy.
			Returns:
				An ES6 Proxy object.
		*/
		create: function(target, domDelay, observer) {

			// test if the target is a Proxy, if it is then we need to retrieve the original object behind the Proxy.
			// we do not allow creating proxies of proxies because -- given the recursive design of ObservableSlim -- it would lead to sharp increases in memory usage
			if (target.__isProxy === true) {
				target = target.__getTarget;
				//if it is, then we should throw an error. we do not allow creating proxies of proxies
				// because -- given the recursive design of ObservableSlim -- it would lead to sharp increases in memory usage
				//throw new Error("ObservableSlim.create() cannot create a Proxy for a target object that is also a Proxy.");
			}

			// fire off the _create() method -- it will create a new observable and proxy and return the proxy
			var proxy = _create(target, domDelay);

			// assign the observer function
			if (typeof observer === "function") this.observe(proxy, observer);

			// recursively loop over all nested objects on the proxy we've just created
			// this will allow the top observable to observe any changes that occur on a nested object
			(function iterate(proxy) {
				var target = proxy.__getTarget;
				var keys  = Object.keys(target);
				for (var i = 0, l = keys.length; i < l; i++) {
					var property = keys[i];
					if (target[property] instanceof Object && target[property] !== null) iterate(proxy[property]);
				}
			})(proxy);

			return proxy;

		},

		/*	Method: observe
				This method is used to add a new observer function to an existing proxy.
			Parameters:
				proxy 	- the ES6 Proxy returned by the create() method. We want to observe changes made to this object.
				observer 	- this function will be invoked when a change is made to the observable (not to be confused with the
							  observer defined in the create() method).
			Returns:
				Nothing.
		*/
		observe: function(proxy, observer) {
			// loop over all the observables created by the _create() function
			var i = observables.length;
			while (i--) {
				if (observables[i].parentProxy === proxy) {
					observables[i].observers.push(observer);
					break;
				}
			}
		},
		/*	Method: pause
				This method will prevent any observer functions from being invoked when a change occurs to a proxy.
			Parameters:
				proxy 	- the ES6 Proxy returned by the create() method.
		*/
/*	Uncomment if this is ever needed.
		pause: function(proxy) {
			var i = observables.length;
			var foundMatch = false;
			while (i--) {
				if (observables[i].parentProxy === proxy) {
					observables[i].paused = true;
					foundMatch = true;
					break;
				}
			}

			if (foundMatch == false) throw new Error("_observableSlim could not pause observable -- matching proxy not found.");
		},
*/
		/*	Method: resume
				This method will resume execution of any observer functions when a change is made to a proxy.
			Parameters:
				proxy 	- the ES6 Proxy returned by the create() method.
		*/
/*	Uncomment if this is ever needed.
		resume: function(proxy) {
			var i = observables.length;
			var foundMatch = false;
			while (i--) {
				if (observables[i].parentProxy === proxy) {
					observables[i].paused = false;
					foundMatch = true;
					break;
				}
			}

			if (foundMatch == false) throw new Error("_observableSlim could not resume observable -- matching proxy not found.");
		},
*/
		/*	Method: pauseChanges
				This method will prevent any changes (i.e., set, and deleteProperty) from being written to the target
				object.  However, the observer functions will still be invoked to let you know what changes WOULD have
				been made.  This can be useful if the changes need to be approved by an external source before the
				changes take effect.
			Parameters:
				proxy	- the ES6 Proxy returned by the create() method.
		 */
/*	Uncomment if this is ever needed.
		pauseChanges: function(proxy){
			var i = observables.length;
			var foundMatch = false;
			while (i--) {
				if (observables[i].parentProxy === proxy) {
					observables[i].changesPaused = true;
					foundMatch = true;
					break;
				}
			}

			if (foundMatch == false) throw new Error("_observableSlim could not pause changes on observable -- matching proxy not found.");
		},
*/
		/*	Method: resumeChanges
				This method will resume the changes that were taking place prior to the call to pauseChanges().
			Parameters:
				proxy	- the ES6 Proxy returned by the create() method.
		 */
/*	Uncomment if this is ever needed.
		resumeChanges: function(proxy){
			var i = observables.length;
			var foundMatch = false;
			while (i--) {
				if (observables[i].parentProxy === proxy) {
					observables[i].changesPaused = false;
					foundMatch = true;
					break;
				}
			}

			if (foundMatch == false) throw new Error("_observableSlim could not resume changes on observable -- matching proxy not found.");
		},
*/
		/*	Method: remove
				This method will remove the observable and proxy thereby preventing any further callback observers for
				changes occuring to the target object.
			Parameters:
				proxy 	- the ES6 Proxy returned by the create() method.
		*/
/*	Uncomment if this is ever needed.
		remove: function(proxy) {

			var matchedObservable = null;
			var foundMatch = false;
			
			var c = observables.length;
			while (c--) {
				if (observables[c].parentProxy === proxy) {
					matchedObservable = observables[c];
					foundMatch = true;
					break;
				}
			}

			var a = targetsProxy.length;
			while (a--) {
				var b = targetsProxy[a].length;
				while (b--) {
					if (targetsProxy[a][b].observable === matchedObservable) {
						targetsProxy[a].splice(b,1);
						
						// if there are no more proxies for this target object
						// then we null out the position for this object on the targets array
						// since we are essentially no longer observing this object.
						// we do not splice it off the targets array, because if we re-observe the same 
						// object at a later time, the property __targetPosition cannot be redefined.
						if (targetsProxy[a].length === 0) {
							targets[a] = null;
						}
					}
				}
			}

			if (foundMatch === true) {
				observables.splice(c,1);
			}
		}
*/
	};
})();

const _prefixScopedVars = (str, varScope=null) => {
	// Handle those inside double quotes.
	str = str.replace(INQUOTES, function(_, innards) {
		return _prefixScopedVarsDo(innards, varScope, true);
	});
	// Handle the rest.
	str = _prefixScopedVarsDo(str, varScope);

// note these will need to be part of the map ref strategy to avoid double-evaluation.

	return str;
};

const _prefixScopedVarsDo = (str, varScope, quoted) => {
	/**
	 * "str" is a string that could contain scoped variables that need proper set up before evaluating.
	 * It finds each word, which may include a period (.), and see if this needs scoping. It may already have a scoped prefix. If it doesn't, it gets
	 * a scoped prefix added. At the end it will return the formatted string. It will only add the "scopedProxy." prefix if the word exists in the string.
	 * If a variable is in quotes, it substitutes the value itself into the return string.
	*/
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\$]([\u00BF-\u1FFF\u2C00-\uD7FF\w\$\.\[\]\'\"]+)?)\}/gim, function(_, wot) {
		if (wot.match(/^[\d]+$/)) return '{' + wot + '}';
		if (wot == 'true' || wot == 'false') return wot;
		let scoped = _getScopedVar(wot, varScope);
		return (typeof scoped.val !== 'undefined') ? (quoted) ? scoped.val : scoped.fullName : wot;
	});
	return str;
};

const _preReplaceVar = (str, varReplacementRef=-1, func='') => {
	let isRender = func.startsWith('Render');
	if (varReplacementRef === -1) return (isRender) ? _escapeItem(str) : str;
	if (typeof resolvingObj[varReplacementRef] === 'undefined') resolvingObj[varReplacementRef] = [];
	let subRef = resolvingObj[varReplacementRef].length;
	let ret = '__acss' + UNIQUEREF + '_' + varReplacementRef + '_' + subRef + '_';
	resolvingObj[varReplacementRef][subRef] = (isRender) ? _escapeItem(str) : str;
	return ret;
};


const _removeVarPlaceholders = obj => {
	/**
	* Handle text nodes.
	* Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.
	*/
	// Remove variable placeholders. If there is no content yet, leave an empty text node.

	let treeWalker = document.createTreeWalker(
		obj,
		NodeFilter.SHOW_COMMENT
	);

	// Iterate tree and find unique ref enclosures, mark content node directly with var reference and remove comment nodes.
	let nodesToRemove = [];
	let thisNode, thisVar, insertedNode;
	while (treeWalker.nextNode()) {
		thisNode = treeWalker.currentNode;
		if (thisNode.data.substr(0, 11) == 'active-var-') {
			nodesToRemove.push(thisNode);	// Mark for removal.
			thisVar = thisNode.data.substr(11);
			// Now we can get rid of the comments altogether and make the node itself be the reference.
			if (varMap[thisVar] === undefined) varMap[thisVar] = [];
			if (thisNode.nextSibling.data == '/active-var') {
				// There is no content there. Insert an empty text node now. A variable was probably empty when first drawn.
				let checkVar = _getScopedVar('scopedProxy.' + thisVar);
				if (checkVar.val === undefined) _set(scopedProxy, thisVar, '');	// set it if it isn't already - we need this for undefined reactive variables to update.
				nodesToRemove.push(thisNode.nextSibling);	// Mark for removal.
				insertedNode = thisNode.parentNode.insertBefore(document.createTextNode(''), thisNode.nextSibling);
				varMap[thisVar].push(insertedNode);
			} else {
				varMap[thisVar].push(thisNode.nextSibling);
			}
		} else if (thisNode.data == '/active-var') {
			nodesToRemove.push(thisNode);	// Mark for removal. Don't remove them yet as it buggers up the treewalker.
		}
	}

	nodesToRemove.forEach(nod => {	// jshint ignore:line
		nod.remove();
	});


	/**
	* Handle style tags (but not embedded Active CSS).
	* Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.
	*/
	// We'll be storing reactive variable references to the style tag (varStyleMap) + the reference to the original contents of the style tag (varInStyleMap).
	treeWalker = document.createTreeWalker(
		obj,
		NodeFilter.SHOW_ELEMENT
	);
	let str, el;

	do {
		el = treeWalker.currentNode;
		if (el.tagName == 'STYLE' && !_isACSSStyleTag(el)) {
			if (!el._acssActiveID) _getActiveID(el);
			str = treeWalker.currentNode.textContent;
			// Store the original contents of the style tag with variable placeholders.
			if (varInStyleMap[el._acssActiveID] === undefined) varInStyleMap[el._acssActiveID] = str;

			// Now set up references for the reactive variable to link to the style tag. This way we only update style tags that have changed.
			// Remove the variable placeholders at the same time.
			str = varInStyleMap[el._acssActiveID].replace(STYLEREGEX, function(_, wot, wot2, wot3) {	// jshint ignore:line
				if (varStyleMap[wot] === undefined) varStyleMap[wot] = [];
				varStyleMap[wot].push(el);
				let thisColonPos = wot.indexOf('HOST');
				if (thisColonPos !== -1) {
					let varName = wot.substr(thisColonPos + 4);
					let varHost = idMap['id-' + wot.substr(1, thisColonPos - 1)];
					if (!varHost || !varHost.hasAttribute(varName)) return '';
					return varHost.getAttribute(varName);
				} else {
					// This is a regular scoped variable. Find the current value and return it or return what it was if it isn't there yet.
					let scoped = _getScopedVar(wot, '___none');
					return (scoped.val) ? scoped.val : '';
				}
				return wot2 || '';
			});
			el.textContent = str;	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
		}
	} while (treeWalker.nextNode());
};

// Replace attributes if they exist. Also the {$RAND}, as that is safe to run in advance. This is run at multiple stages at different parts of the runtime
// config on different objects as they are needed. Also replace JavaScript expressions {= expression}.
// Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.

const _replaceAttrs = (obj, sel, secSelObj=null, o=null, func='', varScope=null, evType='', varReplacementRef=-1) => {
	// Note, obj could sometimes be a string with no attributes if this is a trigger.
	// For this to be totally safe, we escape the contents of the attribute before inserting.
	if (!sel) return '';
	if (sel.indexOf('{@') !== -1) {
		sel = sel.replace(/\{\@(\@?[^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let getProperty = false;
			if (wot.startsWith('@')) {
				getProperty = true;
				wot = wot.substr(1);
			}
			let wotArr = wot.split('.'), ret;
			if (wotArr[1] && wotArr[0] == 'selected' && obj.tagName == 'SELECT') {
				// If selected is used, like [selected.value], then it gets the attribute of the selected option, rather than the select tag itself.
				ret = _getAttrOrProp(obj, wotArr[1], getProperty, obj.selectedIndex, func);
				if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef, func);
			} else {
				let colon = wot.lastIndexOf(':');	// Get the last colon - there could be colons in the selector itself.
				let res;
				if (colon !== -1) {
					// This should be an id followed by an attribute, or innerText, or it's a shadow DOM host attribute.
					let elRef = wot.substr(0, colon), el;
					let compOpenArr = ['beforeComponentOpen', 'componentOpen'];
					if (elRef == 'host') {
						let oEvIsCompOpen = (o && (compOpenArr.indexOf(o.event) !== -1 || o.origO && compOpenArr.indexOf(o.origO.event) !== -1));
						if (compOpenArr.indexOf(evType) !== -1 || oEvIsCompOpen) {
							// This has come in from beforeComponentOpen or componentOpen in passesConditional and so obj is the host before render.
							// o.origO handles coming from a trigger event from these component opening events.
							el = obj;
						} else if (o && o.compDoc && o.compDoc.nodeType == Node.ELEMENT_NODE) {
							el = o.compDoc;
						} else if (!o || !oEvIsCompOpen) {
							if (obj.shadowRoot) {
								el = obj.shadowRoot;
							} else {
								return '{@' + wot + '}';	// Need to leave this alone. We can't handle this yet. This can be handled in scopedProxy.
							}
						}
					} else {
						el = _getSel(o, elRef);
					}
					let wat = wot.substr(colon + 1);
					if (el.tagName == 'IFRAME' && wat == 'url') {
						// If this is an iframe and the virtual attribute url is chosen, get the actual url inside the iframe.
						// We can't rely on the src of the iframe element being accurate, as it is not always updated.
						return _preReplaceVar(_escapeItem(el.contentWindow.location.href, varReplacementRef), func);
					} else {
						res = checkAttrProp(el, wat, getProperty, func);
						if (res !== false) return res;
					}
				} else {
					res = checkAttrProp(secSelObj, wot, getProperty, func, varReplacementRef);
					if (res !== false) return res;
					res = checkAttrProp(obj, wot, getProperty, func, varReplacementRef);
					if (res !== false) return res;
					// Check if there is an origO object from a trigger to check the calling target selector or event selector elements.
					if (o && o.origO) {
						res = checkAttrProp(o.origO.secSelObj, wot, getProperty, func, varReplacementRef);
						if (res !== false) return res;
						res = checkAttrProp(o.origO.obj, wot, getProperty, func, varReplacementRef);
						if (res !== false) return res;
					}
				}
			}
			return '';	// More useful to return an empty string. '{@' + wot + '>';
		});
	}
	function checkAttrProp(el, wot, getProperty, func, varReplacementRef) {
		if (el && el.nodeType == Node.ELEMENT_NODE) {
			let ret = _getAttrOrProp(el, wot, getProperty, null, func);
			if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef, func);
		}
		return false;
	}
	return sel;
};

const _replaceComponents = (o, str, varReplacementRef=-1) => {
	// This needs to be recursive to facilitate easier syntax. XSS defense needs to occur elsewhere otherwise this ceases to be useful. This must stay recursive.
	let co = 0, found;
	while (co < 50) {
		found = false;
		co++;

		// Handle ID tag content insertion first.
		str = _replaceHTMLVars(o, str);

		// Now handle real component insertion.
		// See create-element code for why this is used: "_acss-host_' + tag + '_"
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-]+)\}/gi, function(_, c) {	// jshint ignore:line
			// Note: if the item is empty or if it references an empty component, we always finally return '';
			let customElComp = false;
			if (c.substr(0, 11) == '_acss-host_') {
				// This is a component assigned to a custom element. We want this to get scoped when it is drawn regardless of whether there are events or not.
				customElComp = true;
				c = c.substr(11);
			}
			if (!components[c]) return '{|' + c + '}';
			let ret = components[c].data.trim();
			found = true;
			ret = ActiveCSS._sortOutFlowEscapeChars(ret);
			if (components[c].shadow || components[c].scoped || customElComp) {
				// This is supposed to be added to its container after the container has rendered. We shouldn't add it now.
				// Add it to memory and attach after the container has rendered. Return a placeholder for this component.
				// Note, we have by this point *drawn the contents of this component - each instance is individual*, so they get rendered separately and
				// removed from the pending array once drawn.
				compCount++;
				let compRef = '<data-acss-component data-name="' + c + '" data-ref="' + compCount + '"></data-acss-component>';
				compPending[compCount] = ret;
				// Replace the fully rendered component instance with the compRef placeholder.
				ret = compRef;
			} else {
				ret = ActiveCSS._sortOutFlowEscapeChars(ret);
				let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
					{
						str: ret,
						func: o.func,
						o,
						obj: o.obj,
						varScope: o.varScope
					}
				);
				strObj = _handleVars([ 'strings' ],
					{
						obj: null,
						str: strObj.str,
						varScope: o.varScope
					},
					strObj.ref
				);
				strObj = _handleVars([ 'strings' ],
					{
						str: strObj.str,
						o: o.ajaxObj,
						varScope: o.varScope
					},
					strObj.ref
				);
				ret = _resolveVars(strObj.str, strObj.ref);
			}
			return (ret) ? ret : '';
		});
		if (!found) break;
	}
	if (co == 50) _err('Recursion detected during component rendering. Exited after 50 attempts', o);
	return str;
};

const _replaceJSExpression = (sel, realVal=false, quoteIfString=false, varScope=null, varReplacementRef=-1, o=null) => {
	if (sel.indexOf('{=') === -1) return sel;
	let res;

	sel = sel.replace(/\{\=([\s\S]*?)\=\}/gm, function(str, wot) {
		// Evaluate the JavaScript expression.
		// See if any unscoped variables need replacing.
		wot = _replaceScopedVarsExpr(wot, varScope);

		let q = '';
		if (quoteIfString) {
			q = '"';
		}
		// If this contains tabs or lines then it better be a string. It won't evaluate with those characters.
		if (["\t", "\n", "\r"].some(v => wot.includes(v))) {
			res = (quoteIfString) ? q + wot + q : wot;
			return _preReplaceVar(res, varReplacementRef);
		}

		try {
			res = Function('scopedProxy, o', '"use strict";return (' + wot + ');')(scopedProxy, o);		// jshint ignore:line
		} catch (err) {
			try {
				res = Function('scopedProxy, o', '"use strict";return ("' + wot.replace(/"/gm, '\\"') + '");')(scopedProxy, o);		// jshint ignore:line
			} catch (err) {
				// Try as a string.
				console.log('JavaScript expression error (' + err + '): ' + sel + '. Is this a string variable that needs double-quotes?');
				console.log('Actual expression evaluated: ' + wot);
			}
		}
		if (!realVal) {		// If realVal is set to true, we want to return the actual expression result in this case, so do nothing here.
			// Res should always be a string in the config, even if evaluated into a conditional. This is because the config is made up of strings.
			res = (res === true) ? 'true' : (res === false) ? 'false' : (res === null) ? 'null' : (typeof res === 'string') ? q + res + q : (typeof res === 'number') ? res.toString() : 'Invalid expression (' + wot.trim() + ')';
		}
		return _preReplaceVar(res, varReplacementRef);
	});

	// Return the result rather than the string if realVal is set to true.
	return (realVal) ? res : sel;
};

const _replaceRand = str => {
	if (str.indexOf('{$RAND') !== -1) {
		str = str.replace(/\{\$RAND((HEX)?(STR)?([\d]+)?(\-)?([\d]+)?)?\}/gm, function(_, __, isHex, isStr, num, hyph, endNum) {
			if (num) num = parseInt(num);
			if (endNum) endNum = parseInt(endNum);
			return hyph ? (Math.floor(Math.random() * (endNum - num + 1)) + num) : _random( ((num) ? num : 8) , (isStr ? true : false) , (isHex ? true : false) );
		});
	}
	return str;
};

const _replaceScopedVars = (str, obj=null, func='', o=null, fromUpdate=false, shadHost=null, varScope=null, varReplacementRef=-1) => {
	// Evaluate and insert scoped variables. This could be a HTML string containing nodes.
	// This should only happen after attribute substitution has occurred, otherwise binding in attributes won't work fully.
	// Eg.: set-attribute: data-name "{{firstName}} {@id}{{surname}} {{surname}}". Simply put, the ID is not easily obtainable when updating the attribute with
	// a bound variable. If this becomes a problem later, we would have to store the expand this to reference the location of the attribute via the active ID. But
	// it is fine as it is at this point in development.
	// This function is also called when an variable change triggers an attribute update.
	let fragment, fragRoot, treeWalker, owner, txt, cid, thisHost, actualHost, el, attrs, attr;
	// Convert string into DOM tree. Walk DOM and set up active IDs, search for vars to replace, etc. Then convert back to string. Hopefully this will be quick.
	// Handle inner text first.
	if (!fromUpdate && func.startsWith('Render') && str.indexOf('{{') !== -1 && str.indexOf('</') !== -1) {
		let newStr = str._ACSSRepQuo();
		fragRoot = document.createElement('template');
		fragRoot.innerHTML = newStr;

		// First label any custom elements that do not have inner components, as these need to act as hosts, so we need to pass this host when replacing attributes.
		treeWalker = document.createTreeWalker(
			fragRoot.content,
			NodeFilter.SHOW_ELEMENT
		);
		while (treeWalker.nextNode()) {
			if (customTags.includes(treeWalker.currentNode.tagName)) {
				// Scope all custom tags by default.
				treeWalker.currentNode.setAttribute('data-active-scoped', '');
			}
		}

		// Now handle any attributes. Same tree - iterate again from the top now that the .closest elements are in place.
		treeWalker.currentNode = fragRoot.content;
		while (treeWalker.nextNode()) {
			el = treeWalker.currentNode;
			attrs = el.attributes;
			thisHost = (el.parentElement) ? el.parentElement.closest('[data-active-scoped]') : null;
			actualHost = (thisHost) ? thisHost : shadHost;
			for (attr of attrs) {
				if (['data-activeid'].indexOf(attr.nodeName) !== -1) continue;
				let newAttr = _replaceScopedVarsDo(attr.nodeValue, null, 'SetAttribute', { secSelObj: el, actVal: attr.nodeName + ' ' + attr.nodeValue }, true, actualHost, varScope);
				el.setAttribute(attr.nodeName, newAttr);
			}
		}

		// Handle text nodes.
		treeWalker = document.createTreeWalker(
			fragRoot.content,
			NodeFilter.SHOW_TEXT
		);
		while (treeWalker.nextNode()) {
			el = treeWalker.currentNode;
			owner = el.parentNode;
			if (owner.nodeType == 11) continue;
			cid = _getActiveID(owner);
			txt = el.textContent;
			thisHost = (el.parentElement) ? el.parentElement.closest('[data-active-scoped]') : null;
			actualHost = (thisHost) ? thisHost : shadHost;
			el.textContent = _replaceScopedVarsDo(txt, owner, 'asRender', null, true, actualHost, varScope, undefined, true);
		}

		// Convert the fragment back into a string.
		str = fragRoot.innerHTML;
		str = str.replace(/_cj_s_lt_/gm, '<!--');
		str = str.replace(/_cj_s_gt_/gm, '-->');
		str = str.replace(/_cj_s_lts_/gm, '/*');
		str = str.replace(/_cj_s_gts_/gm, '*/');
	} else {
		// Come in from an var change or there are no nodes - so no point creating a tree and going through all that stuff to set up sub Active IDs and all that
		// sort of thing.
		str = _replaceScopedVarsDo(str, obj, func, o, false, shadHost, varScope, varReplacementRef);
	}
	return str;
};

// This function must only be called when inserting textContent into elements - never any other time. All variables get escaped so no HTML tags are allowed.
const _replaceScopedVarsDo = (str, obj=null, func='', o=null, walker=false, shadHost=null, varScope=null, varReplacementRef=-1, noHTMLEscape=false) => {
	let res, cid, isBound = false, isAttribute = false, isHost = false, originalStr = str;

	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{((\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w\$\' \"\-\.\:\[\]]+(\})?)\}/gm, function(_, wot) {
			if (wot.startsWith('$') || wot.indexOf('.$') !== -1) return '{' + wot + '}';
			let realWot;
			if (wot[0] == '{') {		// wot is a string. Double curly in pre-regex string signifies a variable that is bound to be bound.
				isBound = true;
				// Remove the outer parentheses now that we know this needs binding.
				wot = wot.slice(1,-1);
			}
			let origVar = wot;	// We don't want the outer curlies - just the variable name before scoping.
			if (wot[0] == '@') {
				// This is an attribute not handled earlier. It's hopefully a shadow DOM host attribute as regular bound attribute vars are not yet supported.
				if (!shadHost) return _;	// Shouldn't handle this yet. Only handle it when called from _renderCompDoms.
				isAttribute = true;
				wot = wot.slice(1);
				let hostColon = 'host:';
				if (wot.indexOf(hostColon) !== -1) {
					isHost = true;
					wot = wot.replace(hostColon, '');
					res = (shadHost.hasAttribute(wot)) ? (noHTMLEscape || func == 'SetAttribute') ? shadHost.getAttribute(wot) : _escapeItem(shadHost.getAttribute(wot)) : '';
					let hostCID = _getActiveID(shadHost).replace('d-', '');
					realWot = hostCID + 'HOST' + wot;	// Store the host active ID so we know that it needs updating inside a shadow DOM host.
				} else {
					_warn('Non component attribution substitution is not yet supported', o);
					return _;
				}
			} else {
				let scoped = _getScopedVar(wot, varScope);
				res = scoped.val;

				// Return an empty string if undefined.
				res = (res === true) ? 'true' : (res === false) ? 'false' : (res === null) ? 'null' : (typeof res === 'string') ? ((noHTMLEscape || func == 'SetAttribute') ? res : _escapeItem(res, origVar)) : (typeof res === 'number') ? res.toString() : (res && typeof res === 'object') ? '__object' : '';	// remember typeof null is an "object".
				realWot = scoped.name;
			}
			if (isBound && (func == 'asRender' || func.indexOf('Render') !== -1)) {
				// We only need comment nodes in content output via render - ie. visible stuff. Any other substitution is dynamically rendered from
				// original, untouched config.
				_addScopedCID(realWot, obj, varScope);
				let retLT, retGT;
				if (obj.tagName == 'STYLE') {
					retLT = (walker) ? '_cj_s_lts_' : '/*';
					retGT = (walker) ? '_cj_s_gts_' : '*/';
				} else {
					retLT = (walker) ? '_cj_s_lt_' : '<!--';
					retGT = (walker) ? '_cj_s_gt_' : '-->';
				}
				let placeHolder = _varChangeToDots(realWot);
				return retLT + 'active-var-' + placeHolder + retGT + res + retLT + '/active-var' + retGT;
			} else {
				// If this is an attribute, store more data needed to retrieve the attribute later.
				if (func == 'SetAttribute') {
					// Inner brackets vars get resolved into the original string so that we get reactivity happening correctly in loops, etc.
					_addScopedAttr(realWot, o, _resolveInnerBracketVars(originalStr, varScope), walker, varScope);
				}
				// Send the regular scoped variable back.
				return _preReplaceVar(res, varReplacementRef);
			}
		});
	}

	return str;
};

const _replaceScopedVarsExpr = (str, varScope=null) => {
	// This function attempts to locate and replace any internal variables in a JavaScript expression or "run" function.
	if (str == 'true' || str == 'false' || str == 'null') return str;		// See isNaN MDN for interesting rules.

	let res, origWot, firstVar;
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FFa-z\$]([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\:\'\"\[\]]+)?)\}/gim, function(_, wot) {
		if (wot.startsWith('$') || wot.indexOf('.$') !== -1) return '{' + wot + '}';
		origWot = wot;
		let scoped = _getScopedVar(wot, varScope);
		// Return the wot if it's a window variable.
		if (scoped.winVar === true) return '{' + wot + '}';
		res = scoped.val;
		if (res !== undefined) {
			// Variable definitely exists in some form.
			return res;
		} else {
			return '{' + origWot + '}';
		}
	});

	// By this point the result is a string or a reference to a variable.
	return str;
};

const _replaceStringVars = (o, str, varScope, varReplacementRef=-1) => {
	// This function should only deal once with {$STRING}, and once with HTML variables. Gets called for different reasons, hence it's purpose is double-up here.
	// This is the function that translates HTML variables for an output string.
	let res = '';
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\[\]\.\$]+)\}/gi, function(_, innards) {
		switch (innards) {
			case '$STRING':
				if (o && o.res) {
					res = _preReplaceVar(o.res, varReplacementRef);
				} else {
					res = '{$STRING}';
				}
				return res;

			case '$HTML_NOVARS':
			case '$HTML_ESCAPED':
			case '$HTML':
				let scoped = _getScopedVar('__acss' + innards.substr(1), varScope);
				if (!scoped.val && typeof scoped.val !== 'string') {
					res = '{' + innards + '}';
				} else {
//					res = ActiveCSS._sortOutFlowEscapeChars(scoped.val);
					res = _preReplaceVar(scoped.val, varReplacementRef);
				}
				return res;

			default:
				if (innards.indexOf('$') !== -1 && ['$CHILDREN', '$SELF'].indexOf(innards) === -1) {
					// This should be treated as an HTML variable string. It's a regular Active CSS variable that allows HTML.
					let scoped = _getScopedVar(innards, varScope);
					return (scoped.val) ? _preReplaceVar(scoped.val, varReplacementRef) : '';
				} else {
					return '{' + innards + '}';
				}
		}
	});
	return str;
};

/* Takes a variable and checks if it is allowed to be resolved. This value is set through the var command with _allowResolve. */
const _resolvable = str => {
	return (str.startsWith('scopedProxy.') || resolvableVars.indexOf(str) !== -1 || str.startsWith('window.')) ? true : false;
};

const _resolveAjaxVars = o => {
	let typeORes = typeof o.res;
	let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');
	if (typeORes === 'object' && !o.preGet) {
		if (compScope == 'main') {
			_resolveAjaxVarsDecl(o.res, compScope);
		} else {
			// There could be a potential clash in rendering vars if ajax is called before a component is drawn. This gets around that.
			setTimeout(function() {
				_resolveAjaxVarsDecl(o.res, compScope);
				_ajaxCallbackDisplay(o);
			}, 0);	// jshint ignore:line
			return;
		}
	} else if (typeORes === 'string') {
		// Escape any embedded Active CSS or JavaScript so it doesn't get variable substitution run inside these.
		o.res = _escapeInline(o.res, 'script');
		o.res = _escapeInline(o.res, 'style type="text/acss"');
		_setHTMLVars(o);
	}
	_ajaxCallbackDisplay(o);
};

const _resolveAjaxVarsDecl = (res, compScope) => {
	// Loop the items in res and assign to variables.
	let v;
	_set(scopedProxy, compScope + '.JSON', res);
	for (v in res) {
		_set(scopedProxy, compScope + '.' + v, res[v]);
	}
};

// Takes a scoped variable reference and returns the true scope.
const _resolveInheritance = scopedVar => {
	// Rules:
	// Variable in will already have a base scope (ie. "main.", "_1.").
	// Variable in will never start with "scopedProxy." or "window.".
	// Variable in may look like this: "main.varname" but may actually be a session or local variable.
	// If it exists in this scope it returns the original scope.
	// If it doesn't exist in this scope it will bubble up the component variables scopes until it reaches the document scope or a strictlyPrivateVars scope.
	// As soon as it finds somewhere the variable exists, it returns the variable reference in that scope.
	// If it doesn't find the variable there, it returns the original scope.

	// Check if this is a session or local variable first.
	let dotPos = scopedVar.indexOf('.');
	if (dotPos !== -1) {
		let lesserScopedVar = scopedVar.substr(dotPos + 1);
		let baseVar = _getBaseVar(lesserScopedVar);
		if (localStoreVars[baseVar] === true) {
			let realScopedVar = 'local.' + lesserScopedVar;
			return { name: realScopedVar, val: _get(scopedProxy.__getTarget, realScopedVar) };
		} else if (sessionStoreVars[baseVar] === true) {
			let realScopedVar = 'session.' + lesserScopedVar;
			return { name: realScopedVar, val: _get(scopedProxy.__getTarget, realScopedVar) };
		}
	}

	// We should be left with page scoped variables.

	// Is this already in the current scope? If so, we don't go any higher - return the original scope reference.
	let val = _get(scopedProxy.__getTarget, scopedVar);
	let origValObj = { 'name': scopedVar, 'val': val };
	if (val !== undefined) return origValObj;

	// Get the current scope so it is a separate item when bubbling up components.
	let i = scopedVar.indexOf('.');
	let currScope = scopedVar.substr(0, i);
	let varName = scopedVar.substr(i + 1);

	// It isn't in the current scope, or this isn't the document scope, so find out if this exists as an inherited variable.
	let actualScopeObj = _resolveInheritanceBubble(currScope, varName);

	// If there is no inherited variable then we assume this is a new variable appearing in the scope the variable is used in,
	// so return the original scope reference. "actualScopeObj" will be false if the variable is not inherited.
	if (!actualScopeObj) return origValObj;

	// This variable is inherited from a higher scope, return the higher scope reference.
	return actualScopeObj;
};

// Works with the _resolveInheritance function to establish the correct scope of a variable.
// This is a recursive function. It is run by calling _resolveInheritance with the variable to resolve. The result is a object with name/val properties.
const _resolveInheritanceBubble = (scope, varName) => {

	// Is this a "strictlyPrivateVars" or "private" (deprecated) scope? If so, we go no higher also.
	// Get component details by scope. We need to check if this a strictlyPrivateVars component or in the main document scope.
	let hostObj = strictPrivVarScopes[scope];
	if (hostObj === undefined || hostObj) {
		// We don't go any higher. And we know the value is undefined already so we return false.
		return false;
	}

	// If it isn't strictlyPrivateVars we go to the parent scope and see if it is there.
	// Get parent component details by scope.
	let parentCompDetails = compParents[scope];
	let parentScope = (parentCompDetails && parentCompDetails.varScope) ? parentCompDetails.varScope : 'main';

	// If there, return it immediately.
	let val = _get(scopedProxy.__getTarget, parentScope + '.' + varName);

	if (val !== undefined) return { name: parentScope + '.' + varName, val };

	// Call this function again with the parent scope until we get false or a name/value object.
	let actualScopeObj = _resolveInheritanceBubble(parentScope, varName);
	if (actualScopeObj) {
		return actualScopeObj;
	}

	return false;
};

const _resolveInnerBracketVars = (str, scope) => {
	// Takes a scoped variable string and replaces the fully variables within brackets.
	// Used in the var command so it can work with _set in the correct scope.
	// Eg. str could complex like: gameState[scopedProxy.main.winner[scopedProxy.main.cheese[1]][0][0].desc]
	// This can either be from a left-hand assignment or a right-hand reference. We just want to translate the fully scoped variables into a result
	// for getting and setting purposes.
	let newStr = str;

	if (str.indexOf('[') !== -1) {
		newStr = str.replace(/\[([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.]+)/g, function(_, innerVariable) {
			// Is this a scoped variable?
			if (DIGITREGEX.test(innerVariable) || _resolvable(innerVariable)) return '[' + innerVariable;	// Do not resolve variable or content found that has not already been defined.
			let res;
			let scoped = _getScopedVar(innerVariable, scope);
			// Leave this commented out for the moment - not convinced this is sorted out until tests have been written.
//			if (typeof scoped.val === 'string') {
//				// Return the value in quotes.
//				res = '"' + scoped.val + '"';
//			} else if (typeof scoped.val === 'number') {
//				// Return the value as it is.
//				res = scoped.val;
//			} else if (scoped.val !== undefined) {
			if (scoped.val !== undefined) {
				// Return the fully scoped name.
				res = scoped.fullName;
			} else {
				// Variable should be whatever was found as it isn't recognised as a variable.
				res = innerVariable;
			}

			return '[' + res;
		});
	}

	// Now evaluate the inner brackets so that we return a result for each inner variable. This is cleaner than leaving these to get evaluated as they are,
	// as they won't evaluate easily. Strange but true.

	// Grab all the innards of all the outer square brackets. This will give us enough to evaluate.
	// Use _replaceConditionalsExpr as a model to handle the balanced brackets. In theory it should be simpler than that function.
	// Then for each full match, evaluate and insert the result into newStr for returning.
	newStr = _resolveInnerBracketVarsDo(newStr);

	return newStr;
};

const _resolveInnerBracketVarsDo = str => {
	if (str.indexOf('scopedProxy.') === -1) return str;
	let newStr = str;
	if (newStr.startsWith('scopedProxy.')) {
		newStr = '__ACSSStartSPr' + newStr.substr(11);
	}
	let escStr = _escInQuo(newStr, 'scopedProxy\\.', '__ACSSScopedP');
	if (escStr.indexOf('scopedProxy.', 1) !== -1) {
		escStr = _escInQuo(escStr, '[', '__ACSSOpSq');
		escStr = _escInQuo(escStr, ']', '__ACSSClSq');
		newStr = recursInnerScoped(escStr);
		newStr = newStr.replace(/__ACSSOpSq/g, '[');
		newStr = newStr.replace(/__ACSSClSq/g, ']');
	}
	newStr = newStr.replace(/__ACSSScopedP/g, 'scopedProxy.');
	newStr = newStr.replace(/__ACSSStartSPr/g, 'scopedProxy');

	return newStr;
};

const recursInnerScoped = str => {
	// Get a full inner-scoped value, with a further inner-scoped value and return the valuated result in string form.
	// If it finds an inner-scoped value, it calls this function again until there is no further inner scoped variable.
	let sc = 'scopedProxy.';
	let startPos = str.indexOf(sc, 1);
	let newBeginning = str.substr(0, startPos);

	let rest = str.substr(startPos);
	let restStartPos = rest.indexOf(sc, 1);

	if (restStartPos !== -1) {		// Note, we don't want to check for a fully scoped variable at the beginning of the string, as we know that.
		// There is a further scoped variable to evaluate.
		rest = recursInnerScoped(rest);
	}

	// From here we have the potential for fully evaluating a scopedVariable. There are no inner scoped variable present.
	// There may be extra closing square brackets that we don't need in the "rest" variable.
	// The result should either be a string or a number (I think anyway - can you even have boolean indexes? Probably - anyway, that won't be supported doing it like this).
	// Eg. scopedProxy.main.cheese[0][0]].desc][0].blah]] needs to extract "scopedProxy.main.cheese[0][0]"
	// Eg. scopedProxy.main.winner['hi'].desc] needs to extract "scopedProxy.main.winner['hi'].desc"
	// Eg. scopedProxy.main.cheese] needs to extract "scopedProxy.main.cheese"
	// Eg. scopedProxy.main.cheese[0][1]] needs to extract "scopedProxy.main.cheese[0][1]"
	// Extract everything up to the first unbalanced closing bracket to get the variable to evaluate and have the rest as the remainder.

	// Split by closing bracket. As we loop through, when we don't get an opening bracket in the array item then we know we've got it all.
	let closArr = rest.split(/\]/gm);
	let closArrLen = closArr.length;
	let variable = '', finished = false;
	let remainder = '';
	for (let i = 0; i < closArrLen; i++) {
		let checkStr = closArr[i];
		if (finished) {
			remainder += ']' + checkStr;
		} else {
			variable += checkStr;
			if (!/\[/.test(checkStr)) {
				finished = true;
			} else {
				variable += ']';
			}
		}
	}
	// Evaluate variable - will be quick as it's fully scoped already.
	let scoped = _getScopedVar(variable), res;
	if (typeof scoped.val === 'string') {
		// Return the value in quotes.
		res = '"' + scoped.val + '"';
	} else if (typeof scoped.val === 'number') {
		// Return the value as it is.
		res = scoped.val;
	} else {
		throw 'Active CSS error: Could not evaluate ' + variable;
	}

	return newBeginning + res + remainder;
};

const _resolveVars = (str, varReplacementRef, func='') => {
 	if (varReplacementRef === -1 || resolvingObj[varReplacementRef] === undefined) return str;
	let regex = new RegExp('__acss' + UNIQUEREF + '_(\\d+)_(\\d+)_', 'gm');
	str = str.replace(regex, function(_, ref, subRef) {
		let res;
		if (resolvingObj[ref] !== undefined && resolvingObj[ref][subRef] !== undefined) {
			res = _escNoVars(resolvingObj[ref][subRef]);
			if (func.startsWith('Render')) {
				// Escape backslashes from variables prior to render.
				res = res.replace(/\\/gm, '____acssEscBkSl');
			}
		}
		return (res) ? res : '';
	});
	// Clean-up
	delete resolvingObj[varReplacementRef];

	// Return the fully resolved string - all variable content should now be substituted in correctly.
	return str;
};

const _restoreStorage = () => {
	let sessionStore = window.sessionStorage.getItem('_acssSession');
	if (sessionStore !== undefined) {
		scopedOrig.session = JSON.parse(sessionStore);
		// Loop immediate items under session and set as session vars for the core to use.
		let key;
		for (key in scopedOrig.session) {
			sessionStoreVars[key] = true;
			_allowResolve('session.' + key);
		}		
	}
	let localStore = window.localStorage.getItem('_acssLocal');
	if (localStore !== undefined) {
		scopedOrig.local = JSON.parse(localStore);
		let key;
		for (key in scopedOrig.local) {
			localStoreVars[key] = true;
			_allowResolve('local.' + key);
		}		
	}
};

const _setCSSVariable = o => {
	if (o.origSecSel == ':root') {
		o.secSelObj.documentElement.style.setProperty(o.func, o.actVal);
	} else {
		o.secSelObj.style.setProperty(o.func, o.actVal);
	}
};

const _setHTMLVars = (o, isEmptyStr=false) => {
	let str = (isEmptyStr) ? '' : o.res;
	let escStr = (isEmptyStr) ? '' : _escNoVars(o.res);
	let safeStr = (isEmptyStr) ? '' : _safeTags(o.res);
	let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');

	_set(scopedProxy, compScope + '.__acssHTML', str);
	// Allow no variables to get rendered from this HTML variable type but keep HTML intact.
	_set(scopedProxy, compScope + '.__acssHTML_NOVARS', escStr);
	// Escape HTML and curlies with safe HTML entities.
	_set(scopedProxy, compScope + '.__acssHTML_ESCAPED', safeStr);
};

ActiveCSS._sortOutFlowEscapeChars = str => {
	/* These strings stay in the config as they are. They get converted:
		1. In replaceAttrs, before JavaScript expressions are evaluated.
		2. In extension monitor, before the action value is drawn on the left or the right.
		3. In extension elements, when the action value is drawn.
		4. It gets put back to the original string value when a target selector or an action value is edited.
	*/
	let mapObj = {
		'_ACSS_later_comma': ',',
		'_ACSS_later_brace_start': '{',
		'_ACSS_later_brace_end': '}',
		'_ACSS_later_semi_colon': ';',
		'_ACSS_later_colon': ':',
		'_ACSS_later_double_quote': '"'
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};

const _varChangeToDots = str => {
	return str.replace(/\[(\"|\')?/g, '.').replace(/(\"|\')?\]/g, '');
};

const _varFixArr = path => {
	let pathArr = path.split('.');
	let thisPath, newPath = pathArr.shift();	// Shift assigns and removes the first item, so all items following get a dot, so it's quicker in the loop.
	for (thisPath of pathArr) {
		if (thisPath.indexOf(' ') !== -1) {
			thisPath = '["' + thisPath.replace(/\\([\s\S])|(")/, "\\$1$2") + '"]';
		} else {
			newPath += '.';
		}
		newPath += thisPath;
	}
	return newPath;
};

/***
 * Called from _observable-slim.js after a change has been made to a scoped variable.
 *
 * How variable data-binding is handled in Active CSS. (Various notes written prior to implementation, so this isn't gospel.)
 * --------------------------------------------------------------------------------------------------------------------------
 * Direct changes to attributes are not covered here - this is just what happens when variables change, not attributes. See the create-element command for that code.
 *
 * All scoped variables that are set are contained to a IIFE limited variable "scoped", and changed via the notifier Proxy "scopedProxy".
 * The "scoped" variable is not referenced directly.
 *
 * Each new variable that gets set adds to a mirror map of the scoped variable that is populated with data relating to what needs updating.
 * This array is created whenever an item is found to render. When a change is made, it is looked up in the render array and it is redrawn accordingly.
 *
 * Each time a variable is rendered, the Active ID related to the target is stored. This is vital for updates to both text content and attributes, to localise
 * any later DOM manipulation and make it quick to search for text nodes and to get the target element in the case of updating attributes.
 *
 * Handling text content in divs, etc. (eg. {{player}}):
 * The data object contains all the information necessary to re-render DOM location, indexed by unique Active ID, and within this can be found items such as
 * comment locations or element attribute locations.
 * Multiple comments fall under the ActiveID, as do multiple attribute locations (per element).
 * Data within comments get fully replaced. This is a simple search for a unique comment string under the Active ID element tree.
 *
 * Handling variables in attributes. (eg. {{player}})
 * Attributes are handled differently. The Active ID element is found. The unrendered string after attribute substitution is stored - this is once per element that
 * targets an attribute. Multiple variables or instances of the same variable can exist within one attribute.
 * On subsequent changes, the process happens again based on the string prior to the previous variable substition, but after the attribute substitution.
 *
 * In both rendering into attributes and regular text, if the element is no longer there, ie. the Active ID is no longer found on the page, then the variable
 * references are removed. This could be set to a remove var command which, on setting the var to a unique value, would trigger a deletion of the references
 * and a deletion of the variable from the scoped container.
 *
 * There should be a preInit event of some kind for the setting of variables so that they are present when the body is first drawn on the page, in the event of
 * server-side code containing vars to render. It should be in the docs that it is recommended for such divs to be hidden until the body draw event occurs, otherwise
 * people will see a flicker of "{player}" in text on the screen, rather than "Dave", during the period where Active CSS initializes.
 *
 * New components and content to render should have the variable substitution occur in the text to render *prior* to the final render of the text and the subsequent
 * draw event.
*/
ActiveCSS._varUpdateDom = (changes) => {
	/**
	 * changes contains eg.:
	 * change.type = add/update/delete	- used here
	 * change.target = ["X","O","X","O","O","X","","",""]
	 * change.property = "3"
	 * change.newValue = "O"
	 * change.previousValue = "";
	 * change.currentPath = "gameState.3"
	 * change.jsonPointer = "/gameState/3"
	 * change.proxy = ["X","O","X","O","O","X","","",""]
	*/

	let change, dataObj, changeDiff, innerChange;
	for (change of changes) {
		// If it is a session storage or local storage object it may not have been rendered if it isn't in scopedData, but the storage itself should be
		// updated at this point. It may have been rendered also, in which case it will do all of that separately further down the script.
		// Keep this simple for speed.
		if (change.currentPath.startsWith('session')) {
			window.sessionStorage.setItem('_acssSession', JSON.stringify(scopedProxy.__getTarget.session));
		} else if (change.currentPath.startsWith('local')) {
			window.localStorage.setItem('_acssLocal', JSON.stringify(scopedProxy.__getTarget.local));
		}

		if (change.currentPath.indexOf('.') === -1 && change.currentPath.indexOf('HOST') === -1) continue;	// Skip all actions on scoped variable root.

		if (typeof change.previousValue == 'object' || typeof change.newValue == 'object') {
			// This is an object or an array, or some sort of type change. Get a diff and apply the applicable change to each item.
			// The reason we've got here in the code is that a whole array is being redeclared or something, and there may be individually rendered sub-elements
			// we need to handle. If you redeclare a whole array, observableslim doesn't send multiple inner changes - so we need to simulate this instead so that
			// we can update the DOM. We're only making the specific changes needed - that's why we use a diff.
			change.previousValue = (!change.previousValue) ? [] : change.previousValue;
			// Sometimes previousValue is returned as a proxy from observableslim. Dunno why. Reference the non-scoped var if so, as it will have the same value.
			change.previousValue = (change.previousValue.__isProxy === true) ? change.previousValue.__getTarget : change.previousValue;
			// This next line brings back a complex object diff that indicates type of change.
			changeDiff = recursiveDiff.getDiff(change.previousValue, change.newValue);	// https://github.com/cosmicanant/recursive-diff

			for (innerChange of changeDiff) {
				innerChange.path = change.currentPath + ((!innerChange.path) ? '' : '.' + innerChange.path.join('.'));

				// Convert for cases of array changes coming in as "main.theCol.a val.a 1" which is no good.
				let varPath = _varFixArr(innerChange.path);
				dataObj = _get(scopedData, varPath);
				if (dataObj === undefined) continue;		// No point doing anything yet - it's not been rendered.

				innerChange.val = (!innerChange.val) ? '' : innerChange.val;
				_varUpdateDomDo({
					currentPath: innerChange.path,
					newValue: innerChange.val,
					type: innerChange.op
				}, dataObj);	// We need this - we may have a complex object.
			}
		} else {
			// Convert for cases of array changes coming in as "main.theCol.a val.a 1" which is no good.
			let varPath = _varFixArr(change.currentPath);
			dataObj = _get(scopedData, varPath);
			if (dataObj === undefined) continue;		// No point doing anything yet - it's not been rendered.

			// Convert the currentPath for placeholders.
			change.currentPath = _varChangeToDots(change.currentPath);
			_varUpdateDomDo(change, dataObj);
		}
	}
};

const _varUpdateDomDo = (change, dataObj) => {
	let refObj, cid, el, pos, treeWalker, commentNode, frag, thisNode, content, attrArr, attr, attrOrig, attrContent, theHost, theDoc, colonPos, obj, scopeRef;

	// Get the reference object for this variable path if it exists.
	refObj = change.newValue;

	// Handle content wrapped in comments.
	// Loop all items that are affected by this change and update them. We can get the Active IDs and isolate the tags required.
	colonPos = change.currentPath.indexOf('HOST');
	let compScope = null;

	// There has been a recent change whereby the scope of the document may have nothing to with the scope of the variable. Ie. you can have nested shadow DOM
	// components in the document variable scope, or you could have a non-private component within a shadow DOM area.

	// dataObj contains the correct variable information. That contains the top host of the variable scope.
	// theDoc needs to contain the correct display root on a per item basis - so it cannot be worked out in advance.
	// Same for theHost. It can no longer be worked out in advance now that variable scoping spreads beyond component boundaries.

	// Is this a scoped component variable? If so, it will look something like this: _3.varname.
	if (change.currentPath.substr(0, 1) == '_') {
		compScope = change.currentPath.substr(0, change.currentPath.indexOf('.'));
		if (change.type == 'delete' && compScope == '') {
			// The whole scope has been deleted. Clean up. Don't clean-up session or local storage as they need to persist until manual deletion.
			_deleteScopeVars(change.currentPath);
			return;
		}
	}

	// Update text nodes.
	if (typeof varMap[change.currentPath] === 'object') {
		varMap[change.currentPath].forEach((nod, i) => {	// jshint ignore:line
			if (!nod.isConnected) {
				// Clean-up.
				varMap[change.currentPath].splice(i, 1);
			} else {
				// Update node. By this point, all comment nodes surrounding the actual variable placeholder have been removed.
				nod.textContent = _unEscNoVars(refObj.toString());
			}
		});
	}

	// Update style nodes.
	if (typeof varStyleMap[change.currentPath] === 'object') {
		varStyleMap[change.currentPath].forEach((nod, i) => {	// jshint ignore:line
			if (!nod.isConnected) {
				// Clean-up.
				varStyleMap[change.currentPath].splice(i, 1);
				delete varInStyleMap[nod];
			} else {
				// Update style tag.
				// What we do now is replace with ALL the current values contained in the string - not just what has changed.
				let str = varInStyleMap[nod._acssActiveID].replace(STYLEREGEX, function(_, wot) {	// jshint ignore:line
					if (wot == change.currentPath) {
						return refObj;
					} else {
						let thisColonPos = wot.indexOf('HOST');
						if (thisColonPos !== -1) {
							let varName = wot.substr(thisColonPos + 4);
							let varHost = idMap['id-' + wot.substr(1, thisColonPos - 1)];
							if (!varHost || !varHost.hasAttribute(varName)) return _;
							return varHost.getAttribute(varName);
						} else {
							// This is a regular scoped variable. Find the current value and return it or return what it was if it isn't there yet.
							let val = _get(scopedProxy.__getTarget, wot);
							return (val) ? val : _;
						}
					}
				});
				nod.textContent = _unEscNoVars(str.toString());	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
			}
		});
	}

	// Handle content in attributes. The treewalker option for attributes is deprecated unfortunately, so it uses a different method.
	let found;

	for (cid in dataObj.attrs) {
		found = false;
		for (attr in dataObj.attrs[cid]) {
			if (!found) {
				found = true;	// Only need to do this once per element to get the correct scope.
				scopeRef = dataObj.attrs[cid][attr].scopeRef;	// Scope ref is the *display* area - not the variable area!
				theDoc = (!scopeRef) ? document : actualDoms[scopeRef];
				if (theDoc === undefined) break;	// Not there, skip it. It might not be drawn yet.

				// The host specifically refers to the root containing the component, so if that doesn't exist, there is no reference to a host element.
				theHost = (supportsShadow && theDoc instanceof ShadowRoot) ? theDoc.host : idMap['id-' + change.currentPath.substr(1, colonPos - 1)];
				el = idMap[cid];

				if (!el) {
					// The node is no longer there at all. Clean it up so we don't bother looking for it again.
					// Note the current method won't work if the same binding variable is in the attribute twice.
					// If anyone comes up with a sensible use case, we'll change this method, otherwise it's a bit too niche to put in provisions for
					// that scenario at this point.
					delete dataObj.attrs[cid];
					break;
				}
			}
			attrOrig = dataObj.attrs[cid][attr].orig;
			if (!el.hasAttribute(attr)) return;	// Hasn't been created yet, or it isn't there any more. Skip clean-up anyway. Might need it later.
			// Regenerate the attribute from scratch with the latest values. This is the safest way to handler it and cater for multiple different variables
			// within the same attribute. Any reference to an attribute variable would already be substituted by this point.

			attrContent = _replaceScopedVars(attrOrig, null, '', null, true, theHost, compScope);
			el.setAttribute(attr, _unEscNoVars(attrContent));
		}
	}
};

ActiveCSS._deHighlightDOM = () => {
	// Just get rid of all overlays on the screen.
	document.querySelectorAll('.activecss-internal-devtools-overlay').forEach(function (obj) {
		ActiveCSS._removeObj(obj);
	});
};

const _drawHighlight = (rect, disp) => {
	let ov = document.createElement('div');
	ov.classList = 'activecss-internal-devtools-overlay';
	if (disp == 'full') {
		ov.style.backgroundColor = 'rgba(81, 136, 195, 0.46)';
		ov.style.border = '1px solid #34f4ff';
	} else {
		ov.style.border = '3px dashed #34f4ff';
	}
	ov.style.position = 'fixed';
	ov.style.zIndex = '99999999999999';
	ov.style.display = 'block';
	ov.style.borderRadius = '3px';
	ov.style.top = rect.y + 'px';
	ov.style.left = rect.x + 'px';
	ov.style.width = rect.width + ((!isNaN(rect.width)) ? 'px' : '');
	ov.style.height = rect.height + ((!isNaN(rect.height)) ? 'px' : '');
	document.body.appendChild(ov);
};

ActiveCSS._hasSetupEnded = () => {
	// This is called from the extensions. Otherwise, this function would, indeed, be quite pointless.
	return setupEnded;
};

ActiveCSS._highlightDOM = sel => {
	sel = _stripOffConditionals(sel);
	if (sel == 'body' || sel == 'window') {
		_drawHighlight({ x: 0, y: 0, width: '100%', height: '100%' }, 'full');
	} else {
		let rect;
	    try {
			document.querySelectorAll(sel).forEach(function (obj) {
				// Is this element hidden?
				if (getComputedStyle(obj, null).display !== 'none') {
					// Draw full block highlight.
					_drawHighlight(obj.getBoundingClientRect(), 'full');
				} else {
					// It is hidden, so display it briefly, get it's size and then hide it again.
					// Draw a dashed line highlight.
					// Restore display style setting to original values so we don't mess up the web page.
					let currPropValue = obj.style.getPropertyValue('display');
					let currPropPriority = obj.style.getPropertyPriority('display');
					obj.style.setProperty('display', 'block', 'important');
					_drawHighlight(obj.getBoundingClientRect());
					if (currPropValue !== '') {
						obj.style.removeProperty('display');
					} else {
						obj.style.setProperty('display', currPropValue, currPropPriority);
					}
				}
			});
	    } catch(err) {
	        console.log(sel + ' is not a valid selector.');
	    }
	}
};

const _sendMessage = (obj, typ, where, orderNum='') => {
	// This is either a string or an object.
	let str;
	if (typeof obj == 'object') {
		// Need to copy the object otherwise we end up overwrite the event object below, which we don't want.
		let newObj = _clone(obj);
		if (newObj.e) newObj.e = '';	// We get an invocation error on trying to send a cloned event. Don't send it to the extensions. We could send a smaller version if and when it is needed...
		if (newObj.doc) newObj.doc = '';				// Causes circular reference error.
		if (newObj.compDoc) newObj.compDoc = '';		// Just to be safe - we don't need it.
		if (newObj.obj) newObj.obj = '';				// Just to be safe - we don't need it.
		if (newObj.secSelObj) newObj.secSelObj = '';	// Just to be safe - we don't need it.
		str = JSON.stringify(newObj);
	} else {
		str = obj;
	}
	if (!setupEnded) {
		// Active CSS setup has not yet finished and DevTools has not yet handshook with the core.
		// Put the message into a queue. It will get sent when DevTools does the handshake.
		debuggerCo++;
		devtoolsInit.push([ str, typ, debuggerCo ]);
		return;
	}
	if (typ == 'debugOutput') {
		// Internal tracker so panel.js can put them in order before displaying when they arrive, as they don't arrive in sequence.
		if (!orderNum) {	// Note: If a number is already set, that means we have come from the init routine and a number is already set.
			debuggerCo++;
			orderNum = debuggerCo;
		}
	}
	window.postMessage({
		message: str,
		messageType: typ,
		orderNo: orderNum,
		whereTo: where,
		source: 'causejs-devtools-extension'
	}, '*');
};

ActiveCSS._sendOverMediaQueries = () => {
	return JSON.stringify(mediaQueriesOrig);
};

const _stripOffConditionals = sel => {
	let arr = sel.split(':');
	let condLen = arr.length;
	let i;
	let str = arr[0];
	for (i = 1; i < condLen; i++) {		// Start from the second one. A conditional should never be in the first item - that would be an error.
		if (arr[i].trim() === '') continue;
		str += (conditionals[arr[i]]) ? '' : ':' + arr[i];
	}
	return str;
};

const _tellElementsToUpdate = () => {
	if (debuggerActive) {
		// Panel is active. We can send a message. No point doing this if it isn't active as it will get the latest config when it initialises anyway.
		_sendMessage('reloadElements', 'instruction', 'editor');
	}
};

const _tellPanelToUpdate = () => {
	if (debuggerActive) {
		// Panel is active. We can send a message. No point doing this if it isn't active as it will get the latest config when it initialises anyway.
		_sendMessage('reloadPanel', 'instruction', 'tracker');
	}
};

ActiveCSS._addToConfig = (typ, ev, primSel, condList, eachLoop, secSel, act, val) => {	// Used by extensions.
	// Make sure we have this event set up.

	// This doesn't yet support adding components. _setupEvent will need a component flag for that to work probably.

	_setupEvent(ev, primSel);
	switch (typ) {
		case 'a':
			// Add the new rule. It will append to what is there if it exists already.
			val = _cleanUpRuleValue(val);
			let compConfig = config;
			let addArr = val.split(', ');
			let addArrLen = addArr.length, i, arr, ind, thisVal;
			for (i = 0; i < addArrLen; i++) {
				config = _assignRule(compConfig, primSel, ev, condList, secSel, act, addArr[i], '', '', '', eachLoop);
			}
	}
	_tellPanelToUpdate();
};

ActiveCSS._checkEvEditor = debugID => {
	return (evEditorExtID && evEditorExtID == debugID);
};

/* Used in extension only - will need updating when back on it */
ActiveCSS._checkEventDupe = (primSel, condList, ev) => {
	// Check the main config for a duplicate primSel, condList and event. Return 0 if no matching event, 1 if matching event and an element can be inspected,
	// 2 if matching event but no matching element.
	// Just return true or false to test. We can return different strings depending on whether there is an object there that can be inspected if that is better.
	if (config[primSel] && config[primSel][ev] && config[primSel][ev][(condList ? condList : 0)]) {
		// This item exists in the config.
		// Find the first element that matches the selector.
		try {
			// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
			let obj = document.querySelector(primSel);
			if (obj) {
				// Element found that can be inspected.
				return 1;
			} else {
				// No element available for inspection.
				return 2;
			}
		} catch(err) {
			console.log(primSel + ' is not a valid selector (4).');
			return 2;
		}
	} else {
		// This item does not exist in the config.
		return 0;
	}
};

ActiveCSS._checkPrimSel = (activeEl, primSel, ev) => {
	// Work out if this element is relevant to the activeElement.
	// Does a queryselector on this element contain the active element. If so, it's ok for this element event view.
	if (primSel == 'window' || primSel == 'body') return true;
	let res = false;
	try {
		// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
		document.querySelectorAll(primSel).forEach(function (obj, i) {
			if (obj.contains(activeEl)) {
				res = true;
				return false;	// break out now.
			}
		});
		return (!res) ? false : true;
	} catch(err) {
		console.log(primSel + ' is not a valid selector (2).');
		return false;
	}
};

const _cleanUpRuleValue = val => {
	let arr = val.split(',');
	let arrLen = arr.length, i;
	for (i = 0; i < arrLen; i++) {
		arr[i] = arr[i].trim();
	}
	return arr.join(', ');
};

ActiveCSS._editConfig = (typ, oldEv, newEv, oldPrimSel, newPrimSel, oldCondList, newCondList, oldEachLoop='', newEachLoop='', oldSecSel='', newSecSel='', oldAct='', newAct='', oldVal='', newVal='') => {

	// Leave these commented out please. The parameters need converting to an object anyway, and this is handy for now.
//	console.log('typ: ' + typ);
//	console.log('oldEv: ' + oldEv);
//	console.log('newEv: ' + newEv);
//	console.log('oldPrimSel: ' + oldPrimSel);
//	console.log('newPrimSel: ' + newPrimSel);
//	console.log('oldCondList: ' + oldCondList);
//	console.log('newCondList: ' + newCondList);
//	console.log('oldEachLoop: ' + oldEachLoop);
//	console.log('newEachLoop: ' + newEachLoop);
//	console.log('oldSecSel: ' + oldSecSel);
//	console.log('newSecSel: ' + newSecSel);
//	console.log('oldAct: ' + oldAct);
//	console.log('newAct: ' + newAct);
//	console.log('oldVal: ' + oldVal);
//	console.log('newVal: ' + newVal);

	// These are deliberately not necessarily being set yet in the elements extensions if they do not have a value - this is in preparation for editable each loops.
	oldEachLoop = (!oldEachLoop) ? '0' : oldEachLoop;
	newEachLoop = (!newEachLoop) ? '0' : newEachLoop;

	// This doesn't yet support adding components. _setupEvent will need a component flag for that to work probably.

	_setupEvent(newEv, newPrimSel);
	oldVal = _cleanUpRuleValue(oldVal);
	newVal = _cleanUpRuleValue(newVal);
	switch (typ) {
		case 'p':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[oldPrimSel] || !config[oldPrimSel][oldEv] || !config[oldPrimSel][oldEv][oldCondList] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop]) {
				return;
			}
			// Copy the existing primSel's actions.
			let existingSecSels = config[oldPrimSel][oldEv][oldCondList][oldEachLoop];
			// Delete the existing primSel.
			delete config[oldPrimSel][oldEv][oldCondList][oldEachLoop];
			// Clean up.
			if (Object.keys(config[oldPrimSel][oldEv][oldCondList]).length === 0) {
				delete config[oldPrimSel][oldEv][oldCondList];
			}
			if (Object.keys(config[oldPrimSel][oldEv]).length === 0) {
				delete config[oldPrimSel][oldEv];
			}
			if (Object.keys(config[oldPrimSel]).length === 0) {
				delete config[oldPrimSel];
			}
			// Now work out where to put the new Config.
			// Just loop through the existing actions for this primSel and add them.
			let secSel, secSelLen, i;
			for (secSel in existingSecSels) {
				secSelLen = existingSecSels[secSel].length;
				for (i = 0; i < secSelLen; i++) {
					newAct = existingSecSels[secSel][i].name;
					newVal = existingSecSels[secSel][i].value;
					ActiveCSS._addToConfig('a', newEv, newPrimSel, newCondList, newEachLoop, secSel, newAct, newVal);
				}
			}
			break;

		case 's':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[oldPrimSel] || !config[oldPrimSel][oldEv] || !config[oldPrimSel][oldEv][oldCondList] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel]) {
				return;
			}
			// Copy the existing secSel's actions.
			let tmpSecSelObj = config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel];
			// Delete the existing secSel.
			delete config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel];
			// Add the new secSel.
			config[oldPrimSel][oldEv][oldCondList][oldEachLoop][newSecSel] = tmpSecSelObj;
			break;

		case 'a':
			// This is either an action name or an action value change. We do the same edit handling for either one, as the existing add and remove
			// functions should cover all scenarios.
			// Find and remove the old action name and old action value from the config.
			ActiveCSS._removeFromConfig('a', newEv, newPrimSel, newCondList, newEachLoop, newSecSel, oldAct, oldVal);
			// Add the new action name and new action value.
			ActiveCSS._addToConfig('a', newEv, newPrimSel, newCondList, newEachLoop, newSecSel, newAct, newVal);
	}
	_tellPanelToUpdate();
};

ActiveCSS._formatConditional = sel => {
	// The string conds could be multiple conditionals. We want to check each one and format the whole string here to send back.
	// First, split the selector up by colon.
	let arr = sel.split(':');
	let condLen = arr.length;
	let i;
	let str = arr[0];
	for (i = 1; i < condLen; i++) {		// Start from the second one. A conditional should never be in the first item - that would be an error.
		if (arr[i].trim() === '') continue;
		str += ':';
		str += (conditionals[arr[i]]) ? '<span class="active-event-cond-embedded">' + arr[i] + '</span>' : arr[i];
	}
	return str;
};

ActiveCSS._inspectEl = primSel => {
	try {
    	// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
		let el = document.querySelector(primSel);
		inspect(el);
	} catch(err) {
		console.log(primSel + ' is not a valid selector (3).');
	}
};

const _miniHandleEventForEditor = evObj => {
	let obj = evObj.obj;
	let thisAction = evObj.thisAction;
	let component = (evObj.component) ? '|' + evObj.component : null;

	let selectorList = [], thisItem = {}, found = false;
	let selectorListLen = selectors[thisAction].length;
	let i, testSel, sel, compSelCheckPos;

	if (component) {
		for (i = 0; i < selectorListLen; i++) {
			compSelCheckPos = selectors[thisAction][i].indexOf(':');
			if (selectors[thisAction][i].substr(0, compSelCheckPos) !== component) continue;
			testSel = selectors[thisAction][i].substr(compSelCheckPos + 1);
			if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[thisAction][i])) {
			    if (testSel == '&') {
					selectorList.push(selectors[thisAction][i]);
			    } else {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push(selectors[thisAction][i]);
				    	}
				    } catch(err) {
					}
				}
			}
		}
	} else {
		for (i = 0; i < selectorListLen; i++) {
			if (['~', '|'].includes(selectors[thisAction][i].substr(0, 1))) continue;
			testSel = selectors[thisAction][i];
			if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[thisAction][i])) {
				try {	// Needs to be a try/catch as we might some strangely syntaxed element input, and we want it not to continue.
					if (obj.matches(testSel)) {	// ~ check handles external trigger on clash between custom event and custom selector.
						selectorList.push(selectors[thisAction][i]);
					}
				} catch(err) {
				}
			}
		}
	}
	selectorListLen = selectorList.length;
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][thisAction]) {
			if (!thisItem[selectorList[sel]]) {
				thisItem[selectorList[sel]] = {};
			}
			thisItem[selectorList[sel]] = config[selectorList[sel]][thisAction];
			found = true;
		}
	}
	return [ thisItem, found ];
};

const _removeArrItem = (arr, item) => {
	let i;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] === item) {
			arr.splice(i, 1);
			break;
		}
	}
	return arr;
};

ActiveCSS._removeFromConfig = (typ, ev, primSel, condList, eachLoop, secSel, act, val) => {
	let rulePos;
	switch (typ) {
		case 'p':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[primSel] || !config[primSel][ev] || !config[primSel][ev][condList]) {
				return;
			}
			// Delete the primSel.
			delete config[primSel][ev][condList];
			// Clean up.
			if (Object.keys(config[primSel][ev]).length === 0) {
				delete config[primSel][ev];
			}
			if (Object.keys(config[primSel]).length === 0) {
				delete config[primSel];
			}
			break;

		case 's':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[primSel] || !config[primSel][ev] || !config[primSel][ev][condList] || !config[primSel][ev][condList][eachLoop] || !config[primSel][ev][condList][eachLoop][secSel]) {
				return;
			}
			// Delete the secsel.
			_removeArrItem(config[primSel][ev][condList][eachLoop], config[primSel][ev][condList][eachLoop][secSel]);
			// Clean up.
			if (config[primSel][ev][condList][eachLoop].length === 0) {
				_removeArrItem(config[primSel][ev][condList], config[primSel][ev][condList][eachLoop]);
			}
			if (Object.keys(config[primSel][ev][condList]).length === 0) {
				delete config[primSel][ev][condList];
			}
			if (Object.keys(config[primSel][ev]).length === 0) {
				delete config[primSel][ev];
			}
			if (Object.keys(config[primSel]).length === 0) {
				delete config[primSel];
			}
			break;

		case 'a':
			// Find the rule and delete it. It should remove a comma-delimited item if necessary and not the whole thing.
			let compConfig = config;
			config = _removeRule(compConfig, primSel, ev, condList, eachLoop, secSel, act, val);
	}
	// Send message to Panel if it is active.
	_tellPanelToUpdate();
};

const _removeRule = (compConfig, sel, ev, condition, eachLoop, secsel, ruleName, ruleValue) => {
	// Note this rule value may be comma delimited itself, so we need to iterate through the values and remove each one.
	let rulePos;
	if (compConfig[sel][ev][condition] === undefined) return compConfig;
	if (compConfig[sel][ev][condition][eachLoop] === undefined) return compConfig;
	if (compConfig[sel][ev][condition][eachLoop][secsel] === undefined) return compConfig;
	// See if this rule already exists here. It should do.
	rulePos = ActiveCSS._getPosOfRule(compConfig[sel][ev][condition][eachLoop][secsel], ruleName);
	if (rulePos != -1) {
		// Split and rejoin in case spaces are needed in the value we are checking.
		ruleValue = _cleanUpRuleValue(ruleValue);
		if (compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value == ruleValue) {
			// Delete the whole thing. Need to use splice.
			compConfig[sel][ev][condition][eachLoop][secsel].splice(rulePos, 1);
			// Clean up.
			if (compConfig[sel][ev][condition][eachLoop][secsel].length === 0) {
				_removeArrItem(config[sel][ev][condition][eachLoop], config[sel][ev][condition][eachLoop][secsel]);
			}
			if (compConfig[sel][ev][condition][eachLoop].length === 0) {
				delete config[sel][ev][condition][eachLoop];
			}
			if (Object.keys(compConfig[sel][ev][condition]).length === 0) {
				delete config[sel][ev][condition];
			}
			if (Object.keys(compConfig[sel][ev]).length === 0) {
				delete config[sel][ev];
			}
			if (Object.keys(compConfig[sel]).length === 0) {
				delete config[sel];
			}
		} else {
			let remArr = ruleValue.split(',');
			let remArrLen = remArr.length, i, arr, ind, thisVal;
			for (i = 0; i < remArrLen; i++) {
				thisVal = remArr[i].trim();
				// Delete only the part that contains the value we want to delete.
				arr = compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value.split(', ');
				ind = arr.indexOf(thisVal);
				if (index !== -1) {
					arr.splice(index, 1);
				}
				compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value = arr.join(', ');
			}
		}
	}
	return compConfig;
};

ActiveCSS._returnTree = el => {
	if (!setupEnded) {
		return;
	}
	// Put the events for this element into an object for sending to the DevTools editor.
	// Handle all selectors.
	// selectors[thisAction]
	let act, itemConfig = {}, stopProp, arr, origEl = el, co, realEvent, mainElRoot, elRoot, origComponent;
	mainElRoot = _getRootNode(el);
	if (!mainElRoot.isSameNode(document)) {
		origComponent = mainElRoot.host._acssComponent;
		if (!origComponent) origComponent = null;		// Shadow found, but it wasn't set up by Active CSS - so ignore this element, as events won't work on those.
	}
	Object.keys(selectors).sort().forEach(function(act) {
		var doesBubble, doesBubbleOutOfShadow, component = '';
		el = origEl;
		co = 0;
		let ev = act;
		ev = _getRealEvent(ev);
		realEvent = true;
		if (ev === false) {
			realEvent = false;
		}
		component = origComponent;
		if (realEvent) {
			// Does this event bubble? There hasn't been a real event, and I know of no way to get the bubbles prop of an inaccessible event, so
			// simulate a real event to get the default bubbles property.
			// Create a shadow dom element to trigger the same event and don't let it bubble out. This should keep it out of the scope of the main document.
			// If we don't do this, we run the risk of running into user defined event handlers, which we don't want.
			let shadEl = document.createElement('div');
			shadEl.id = 'cause-js-elements-ext';
			document.body.append(shadEl);
			shadEl.attachShadow({ mode: 'open' });
			let inner = document.createElement('div');
			shadEl.shadowRoot.append(inner);
			inner.addEventListener(ev, function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				doesBubble = e.bubbles;
				doesBubbleOutOfShadow = e.composed;
			}, {capture: false, once: true});	// once = remove automatically after running.
			try {
				inner[ev]();
			} catch(err) {
				// This isn't a known event. Could be a user defined Active CSS event.
				doesBubble = false;
				doesBubbleOutOfShadow = false;
			}
			ActiveCSS._removeObj(shadEl);
		} else {
			// ActiveCSS events don't bubble.
			doesBubble = false;
			
		}
		if (act == 'mouseover' || act == 'click') {
			if (el.tagName == 'A' && !el._acssNavDrawn) {
				// Set up any attributes needed for navigation from the routing declaration if this is being used.
				_setUpNavAttrs(el);
			}
		}
		if (el != 'window') {
			if (el) {
				// Note that we can't use .composedPath, as an event hasn't been fired. We have to work it out manually.
				while (el.parentNode) {
					arr = _miniHandleEventForEditor({ obj: el, thisAction: act, component: component });
					if (arr[1]) {
						if (!itemConfig[act]) itemConfig[act] = {};
						if (!itemConfig[act][co]) itemConfig[act][co] = {};
						itemConfig[act][co] = arr[0];
						co++;
					}
					if (!doesBubble) {
						break;
					}
					el = el.parentNode;
					if (el) {
						if (el instanceof ShadowRoot) {
							// Reached the top of the shadow and we are in the shadow. Get the host.
							if (!doesBubbleOutOfShadow) {
								// The original element is in a shadow DOM, this parent node is not in the same shadow DOM and we are not supposed to bubble out. So...
								break;
							}
							el = el.host;
							let thisRootEl = _getRootNode(el);
							if (!thisRootEl.isSameNode(document)) {
								component = thisRootEl.host._acssComponent;
								if (!component) component = null;	// Shadow found, but it wasn't set up by Active CSS - so ignore this element, as events won't work on those.
							} else {
								component = null;
							}
						}
					}
				}
				arr = _miniHandleEventForEditor({ obj: window, thisAction: act });
			}
		}
	});
	_sendMessage(itemConfig, 'treeSent', 'editor');
};

ActiveCSS._startEvEditor = debugID => {
	evEditorActive = true;
	evEditorExtID = debugID;
	return coreVersionExtension;
};

ActiveCSS._checkDebugger = debugID => {
	return (debuggerExtID && debuggerExtID == debugID);
};

const _debugOutput = oCopy => {
	// Do some checks to put into oCopy at this point, so we don't have to come back.
//	oCopy.feedbackRes = [];	// this line errors with popstate event - when coming back to this code, sort it out.

/* Part of a future release. Delete if it gets too old.
	// Check the action function actually exists.
	if (typeof ActiveCSS[oCopy.func] !== 'function') {
		oCopy.feedbackRes.push('/w Action function "' + oCopy.actName + '" does not exist. Skipped');
	}
		
	if (typeof oCopy.secSel != 'object' && !['~', '|'].includes(oCopy.secSel.substr(0, 1))) {
		let checkThere = false, activeID;
		oCopy.doc.querySelectorAll(oCopy.secSel).forEach(function (obj, i) {
			activeID = _getActiveID(obj);
			// The node is there, it might have been cancelled though.
			checkThere = true;
			if (activeID && cancelIDArr[activeID] && cancelIDArr[activeID][oCopy.func]) {
				oCopy.feedbackRes.push('This action was cancelled with "cancel-timer", and did not occur.');
			}
		});
		if (!checkThere) {
			// If the object isn't there, we run it with the remembered object, as it could be from a popstate, but only if this is top-level action command.
			// Only by doing this can we ensure that this is an action which will only target elements that exist.
			if (oCopy.secSel.lastIndexOf('data-active-id') !== -1) {
				// This is probably ok.
			} else {
				oCopy.feedbackRes.push('The target "' + oCopy.secSel + '" is not on the page.');
			}
		}
	}
*/
	_sendMessage(oCopy, 'debugOutput', 'tracker');
};

/* Not used at the moment - this will be for event feedback in the event monitor in the extension.
const _debugOutputFeedback = oCopy => {
	_sendMessage(oCopy, 'debugFeedback', 'tracker');
};
*/
ActiveCSS._sendInitMessages = () => {
	let initArrLen = devtoolsInit.length, i;
	for (i = 0; i < initArrLen; i++){
		_sendMessage(devtoolsInit[i][0], devtoolsInit[i][1], 'tracker', devtoolsInit[i][2]);
	}
	devtoolsInit = [];
};

ActiveCSS._sendOverComponents = () => {
	return JSON.stringify(components);
};

ActiveCSS._sendOverConditionals = () => {
	return JSON.stringify(conditionals);
};

ActiveCSS._sendOverConfig = () => {
	let str = JSON.stringify(config);
	return str;
};

ActiveCSS._sendOverEvents = () => {
	return debuggerEvs;
};

ActiveCSS._startDebugger = debugID => {
	debuggerness = true;
	debuggerActive = true;
	debuggerExtID = debugID;
	return coreVersionExtension;
};

const _stopDebugger = () => {
	debuggerness = false;
	debuggerActive = false;
};

const _stopEvEditor = () => {
	evEditorActive = false;
};

/**
 * Checks if a cookie exists.
 * (Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework)
 *
 * Called by:
 *	IfCookieEquals()
 *	IfCookieExists()
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} nam: The name of the cookie to check existence of.
 *
 * @returns {Boolean} Returns if the cookie exists or not.
 */
const _cookieExists = nam => {
    if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
   	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};

/**
 * Gets the cookie value.
 * (Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework)
 *
 * Called by:
 *	IfCookieEquals
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} nam The name of the cookie to check existence of.
 *
 * @returns {Null} when the cookie doesn't exist.
 * @returns {String} Returns the value of the cookie or null.
 */
const _getCookie = nam => {
	if (!nam) return null;
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
};

/**
 * Sets up the action flow object with an internal .avRaw property that contains the URL before the "?".
 *
 * Called by:
 *	_a.LoadConfig()
 *
 * Side-effects:
 *	Adjusts action flow object (adds an internally used .avRaw property)
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
const _addActValRaw = o => {
	// (AV is a reference to o.actVal)
	// Remove everything before the "?" in the file URL so we can store it for checking later.
	o.avRaw = o.actVal;
	if (o.avRaw.indexOf('?') !== -1) {
		// Remove any parameters to check if it is in configArr - store without the parameters, otherwise we get an accumulation of the same file in configArr.
		o.avRaw = _getBaseURL(o.avRaw);
	}
};

/**
 * Performs an XHR request with callbacks and error handlings.
 *
 * Called by:
 *	_ajaxDo()
 *	_getFile()
 *
 * Side-effects:
 *	Performs an XHR request with callbacks and consoles errors.
 *	Increments/decrements the internally global preGetMid variable.
 *
 * @private
 * @param {String} getMethod: The method, GET, POST, etc.
 * @param {String} fileType: The response type, "html", "txt", "json" or something else which will use "application/x-www-form-urlencoded".
 * @param {String} filepath: The full URL.
 * @param {String} pars: The string of parameters to send as POST vars separated by "&".
 * @param {Function} callback: The success callback function.
 * @param {Function} errcallback: The error callback function.
 * @param {Object} o: Action flow object (optional).
 *
 * @returns nothing
 */
 const _ajax = (getMethod, fileType, filepath, pars, callback, errcallback, o) => {
	preGetMid++;
	var r = new XMLHttpRequest();
	r.open(getMethod, filepath, true);
	var mime;
	switch (fileType) {
		case 'html':
		case 'txt':
			mime = 'text/html';
			break;
		case 'json':
			mime = 'application/json';
			break;
		default:
			mime = 'application/x-www-form-urlencoded';
	}
	r.setRequestHeader('Content-type', mime);
	r.onload = () => {
		if (r.status != 200) {
			// Handle application level error.
			preGetMid--;
			if (errcallback) {
				errcallback(r.responseText, r.status, o);
			} else {
				_err('Tried to get file: ' + filepath + ', but failed with error code: ' + r.status, o);
			}
			return;
		}
		preGetMid--;
		if (callback !== null) {
			callback(r.responseText, o);
		}
	};
	r.onerror = () => {
		// Handle network level error.
		preGetMid--;
		if (errcallback) {
			errcallback('Network error', 0, o);
		} else {
			_err('Tried to get file: ' + filepath + ', but failed due to a network error.');
		}
	};
	if (getMethod == 'POST' && pars !== null) {
		r.send(pars);
	} else {
		r.send();
	}
};

/**
 * The callback function after an XHR request returning 200 ok.
 *
 * Called by:
 *	_ajaxDo()
 *
 * Side-effects:
 *	Calls a function to resolve ajax response variables
 *	Calls a function to setup HTML variables for the core
 *	Calls the XHR error callback function if the JSON response cannot be parsed
 *	Calls the callback display function on success
 *	Adjusts the action flow object by changing the .res property
 *
 * @private
 * @param {String} str: The response string
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallback = (str, o) => {
	// Convert to a str if it be JSON.
	if (typeof str === 'string' && str.trim() !== '') {
		try {
			o.res = (o.dataType == 'JSON') ? JSON.parse(str) : str;
			_resolveAjaxVars(o);
		} catch(err) {
			// If there's an error here, it's probably because the response from the server was 200 ok but JSON.parse failed.
			_ajaxCallbackErr(str, '', o);
		}
		// _ajaxCallbackDisplay(o); is called from _resolveAjaxVars, as it needs to account for the asyncronyousness of the shadow DOM.
	} else {
		o.res = '';
		_setHTMLVars(o, true);	// true for empty string.
		// Commenting out for now - this will be for ajax return feedback.
//		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
//			_debugOutput(o);	//	'', 'ajax' + ((o.preGet) ? '-pre-get' : ''));
//		}
		_ajaxCallbackDisplay(o);
	}
};

/**
 * Handles display after XHR request.
 *
 * Called by:
 *	_resolveAjaxVars()
 *	_ajaxCallback()
 *
 * Side-effects:
 *	Adjusts internally global ajaxResLocations variable to store URL if caching or pre-getting.
 *	Adjusts internally global preGetting variable to remove preGet state of URL.
 *	Runs the afterAjaxPreGet event if appropriate.
 *	Calls _ajaxDisplay which handles success or failure.
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallbackDisplay = (o) => {
	if (!o.error && (o.cache || o.preGet)) {
		// Store it for later. May need it in the afterAjaxPreGet event if it is run.
		ajaxResLocations[o.finalURL] = o.res;
	}
	if (o.preGet) {
		delete preGetting[o.finalURL];
	}
	if (!o.error && o.preGet) {
		// Run the afterAjaxPreGet event.
		_handleEvents({ obj: o.obj, evType: 'afterAjaxPreGet', eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
	} else {
		// Run the post event - success or failure.
		_ajaxDisplay(o);
	}
};

/**
 * Handles error after XHR request.
 *
 * Called by:
 *	_ajaxCallback()
 *
 * Side-effects:
 *	Adjusts properties in action flow object.
 *	Empties asynchronous reference store (for resumption after await or pausing).
 *	Runs specific afterAjax... error event.
 *	Runs general afterAjax...Error event.
 *	Send debug data to the extension.
 *	Adjusts internally global preGetting variable to remove preGet state of URL.
 *
 * @private
 * @param {String} str: Unused in this function, but it needs to exist as the first parameter for browser XHR error callback.
 * @param {String} resp: The XHR response code (404, etc.)
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallbackErr = (str, resp, o) => {
	o.error = true;
	o.errorCode = resp || '';

	// Wipe any existing action commands after await, if await was used.
	_syncEmpty(o._subEvCo);

	// Handle error code event.
	let generalEvent = 'afterAjax' + ((o.preGet) ? 'PreGet' : '') + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	let commonObj = { obj: o.obj, evType: generalEvent + o.errorCode, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo };
	if (o.errorCode) _handleEvents(commonObj);
	commonObj.evType = generalEvent + 'Error';

	// Handle general error event.
	_handleEvents(commonObj);
	if (!o.preGet) {
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax callback error debug: failed with error "' + resp + '".');
		}
	} else {
		delete preGetting[o.finalURL];
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax-pre-get callback error debug: failed with error "' + resp + '".');
		}
	}
};

/**
 * Handles what happens after the successful XHR request callback.
 *
 * Called by:
 *	_ajaxCallbackDisplay()
 *
 * Side-effects:
 *	Adjusts document.location.hash if appropriate
 *	Runs the appropriate afterAjax event
 *	Restarts the sync queue after an await or pause
 *	Triggers any hash event redrawing
 *	Resets the internally global hashEventAjaxDelay variables which detected if a hash event needed to be run or not
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxDisplay = o => {
	let ev = 'afterAjax' + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	_handleEvents({ obj: o.obj, evType: ev, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
	if (o.hash !== '') {
		document.location.hash = '';	// Needed as Chrome doesn't work without it.
		document.location.hash = o.hash;
	}
	if (hashEventAjaxDelay) {
		// Run any delayed hash on the URL events that need running after an ajax call has loaded or is ready for the display.
		hashEventAjaxDelay = false;
		_trigHashState(o.e);
	}
	// Restart the sync queue if await was used.
	_syncRestart(o, o._subEvCo);
};

const _ajaxDo = o => {
	if (o.preGet && preGetMid) {
		// This is a pre-get and there is least one pre-get file being loaded. Is there a pre-get max threshold?
		// Default preGetMax to 2 files allowed to be being loaded at once.
		let maxSet = _getParVal(o.actVal, 'max');
		preGetMax = (maxSet != '') ? maxSet : 6;	// Default to 6 maximum concurrent ajax requests.
		if (preGetMid == preGetMax) return;	// Skip this pre-get - there is a threshold set.
	}
	// Sort out the extra vars and grab the contents of the url.
	let ajaxArr = o.actVal.split(' ');
	o.formMethod = _optDef(ajaxArr, 'get', 'GET', 'POST');
	o.dataType = _optDef(ajaxArr, 'html', 'HTML', 'JSON');
	o.cache = _optDef(ajaxArr, 'cache', true, false);
	o.nocache = _optDef(ajaxArr, 'nocache', true, false);
	let intVars = (o.nocache ? '_=' + Date.now() + '&' : '') + '_ACSS=1' + (o.formPreview ? '&_ACSSFORMPREVIEW=1' : '') + (o.formSubmit ? '&_ACSSFORMSUBMIT=1' : '') + '&_ACSSTYPE=' + o.dataType;
	o.pars = intVars;
	let url = o.url;
	if (o.preGet && url === '') return;	// Don't try to pre-get empty values. It's ok for a regular ajax call.
	if (o.formSubmit) {
		// Send the form.
		o.pars += '&' + _checkForm(o.secSelObj, 'pars');
	}
	if (o.formMethod == 'GET') {
		url = _appendURIPar(url, o.pars, o.doc);
	}
	// Send any extra parameters if they are defined as GET vars, like pars(drawn=y).
	// This can be used when not referenced in setting the url as part of the url-change.
	o.hash = '';
	let hashPos = url.indexOf('#');
	if (hashPos !== -1) {
		o.hash = url.substr(hashPos + 1);
		url = url.substr(0, hashPos);
	}
	url = _attachGetVals(o.actVal, url, o.doc, 'get-pars');
	o.pars = _attachPostVals(o.actVal, o.pars);
	o.finalURL = (o.formMethod == 'GET') ? url : _appendURIPar(url, o.pars, o.doc);	// Need the unique url including post vars to store for the caching.

	// If there is a hash due to run at the end of this event loop, delay it until the afterAjax-type command.
	if (hashEventTrigger) hashEventAjaxDelay = true;

	if (ajaxResLocations[o.finalURL]) {
		// No need to get it - we have it in cache.
		if (!o.preGet) {
			// Display it. Copy the result from the cached object over to the primary selector.
			o.res = ajaxResLocations[o.finalURL];
			_resolveAjaxVars(o);
		}
	} else {
		if (o.preGet) {
			if (preGetting[o.finalURL]) return;	// Already in the process of getting - skip. Note: skip race condition handling - pre-get is a nicety.
			preGetting[o.finalURL] = true;
		}
		_ajax(o.formMethod, o.dataType, url, o.pars, _ajaxCallback.bind(this), _ajaxCallbackErr.bind(this), o);
	}
};

const _appendURIPar = (url, pars, doc) => {
	// This function adds parameters to a url. It replaces values if they are different, and adds any that aren't there.
	// This will break in IE and old Edge browsers as it uses the newer URLSearchParams interface.
	// It's pretty basic but does the job. Could probably be optimised further. It is only called when handling certain
	// action commands, so it doesn't touch core performance.
	// Note: This only currently supports one use of the form var append functionality. More than one referenced will barf.
	// To get it working with more than one, strip out all those refs, put in a separate array and handle them individually.
	// FIXME.
	// Is this a full url? If not, make it so.
	var isFullURL = new RegExp('^([a-z]+://|//)', 'i');
	if (url === '' || !isFullURL.test(url)) {
		url = window.location.protocol + '//' + window.location.host + ((url.substr(0, 1) != '/') ? '/' : '') + url;
	}
	let newUrl = new URL(url);
	let parsArr = pars.split('&'), thisPar, parArr, endBit = '';
	for (thisPar of parsArr) {
		if (thisPar.indexOf('=') !== -1) {
			parArr = thisPar.split('=');
			if (parArr[1]) {
				// Is this a reference to a form ID? If so, we 
				newUrl.searchParams.set(parArr[0], parArr[1]);
			} else {
				newUrl.searchParams.set(parArr[0], '');
			}
		} else {
			if (thisPar.substr(0, 2) == '{#') {
				// This could be a special case where we want to grab all the parameters associated with a form and add them
				// as pars on the url. This can be useful for setting the src in an iframe where values are needed from
				// a form as additional conditions to the src call. Ie. not ajax.
				// Note: With an ajax form, you'd normally use ajax-form or ajax-form-preview and send them as post vars.
				let formID = thisPar.slice(2, -1);
				let el = doc.getElementById(formID);
				if (el.tagName == 'FORM') {
					let formPars = _checkForm(el, 'pars');
					// Call this function again to add the form vars.
					let formedUrl = _appendURIPar(newUrl, formPars, doc);
					newUrl = new URL(formedUrl);
				}	// else silently fail. Maybe the form isn't there any more.
			} else {
				// Remember this clause, we're going to add it on the end. It should be an anchor, which needs to be on the
				// end of the url. Either way it's not a fully formed parameter.
				endBit += thisPar;
			}
		}
	}
	return newUrl + endBit;
};

const _attachGetVals = (str, url, doc, typ) => {
	let pars = _getParVal(str, typ);
	if (pars) {
		url = _appendURIPar(url, pars, doc);
	}
	return url;
};

const _attachPostVals = (str, urlBit) => {
	let pars = _getParVal(str, 'post-pars');
	if (pars) {
		urlBit += '&' + pars;
	}
	return urlBit;
};

const _getFile = (filePath, fileType, o={}) => {
	_ajax('GET', fileType, filePath, null, _addConfig.bind(this), _addConfigError.bind(this), o);
};

const _getParVal = (str, typ) => {
	if (str.indexOf(typ + '(') !== -1) {
		let reg = new RegExp(typ + '\\(([^)]*)\\)', 'g');
		let pars = reg.exec(str) || '';
		if (pars) {
			return pars[1];
		}
	}
	return '';
};

const _absLeft = el => {
	// Position of left edge relative to frame left courtesy of http://www.quirksmode.org/js/findpos.html
	var x = 0;
	for (; el; el = el.offsetParent) {
		x += el.offsetLeft;
	}
	return x;
};

const _absTop = el => {
	// Position of top edge relative to top of frame courtesy of http://www.quirksmode.org/js/findpos.html
	var y = 0;
	for (; el; el = el.offsetParent) {
		y += el.offsetTop;
	}
	return y;
};

const _actValSelItem = o => {
	let arr = o.actVal.split(' ');
	let last = arr.splice(-1);
	return [ _getSel(o, arr.join(' ')), last[0] ];
};

ActiveCSS._addClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	let arr = str.replace('.', '').split(' ');
	obj.classList.add(...arr);
};

const _checkBoundaries = (el, cont, tot) => {
	// Returns true if the boundaries checks pass.
	let left = _absLeft(el),
		right = left + el.offsetWidth,
		top = _absTop(el),
		bottom = top + el.offsetHeight;
	let cleft = _absLeft(cont),
		cright = cleft + cont.offsetWidth,
		ctop = _absTop(cont),
		cbottom = ctop + cont.offsetHeight;

// Working code for counting all 4 corners. For now, we are just interested in supporting vertical.
// More parameters need to be added - horizontal, vertical and both, with a default of vertical if no parameters added.
//	if (tot) {
//		return (left >= cleft && top >= ctop && right <= cright && bottom <= cbottom);
//	} else {
//		return (left >= cleft || right <= cright) && (top >= ctop || bottom <= cbottom);
//	}

	if (tot) {
		return top >= ctop && bottom <= cbottom;
	} else {
		return top >= ctop && bottom <= cbottom || top >= ctop && top <= cbottom || bottom >= ctop && bottom <= cbottom;
	}
};

const _checkForm = (frm, wot) => {
	// opt = 'check' (check if changed), 'pars' (generate as ajax parameters)
	if (!frm) return false;	// form not there, so unchanged.
	var check = (wot == 'check');
	var pars = (wot == 'pars');
	var parStr = '', parAdd = '&';
	var changed = [], n, c, def, i, ol, opt, valu;
	for (var e = 0, el = frm.elements.length; e < el; e++) {
		n = frm.elements[e];
		c = false;
		if (!n.hasAttribute('name')) continue;
		switch (n.nodeName.toLowerCase()) {
			case 'select':
				def = 0;
				for (i = 0, ol = n.options.length; i < ol; i++) {
					opt = n.options[i];
					c = c || (opt.selected != n.defaultSelected);
					if (opt.defaultSelected) def = i;
				}
				if (c && !n.multiple) c = (def != n.selectedIndex);
				parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.options[n.selectedIndex].value);
				break;
			case 'textarea':
			case 'input':
				switch (n.type.toLowerCase()) {
					case 'checkbox':
						c = (n.checked != n.defaultChecked);
						parStr += parAdd + n.getAttribute('name') + '=' + ((n.checked) ? 'on' : '');
						break;
					case 'radio':
						c = (n.checked != n.defaultChecked);
						if (n.checked) {
							parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value);
						}
						break;
					default:
						c = (n.value != n.defaultValue);
						parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value);
						break;
				}
				break;
			case 'hidden':
				parStr += (pars) ? parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value) : '';
				break;
		}
		if (check && c) {
			changed.push(n);
		}
	}
	if (check) {
		return (changed.length) ? true : false;
	} else if (pars) {
		return '_ACSSFORMNAME=' + (frm.name ? frm.name : '') + parStr;
	}
};

const _checkMedia = mediaStr => {
	let mq = window.matchMedia(mediaStr);
	return mq.matches;
};

const _checkSupport = supportStr => {
	if (!SUPPORT_ED) _warn('CSS @support statement is not supported in this browser');
	let res = window.CSS.supports(supportStr);
	return res;
};

/* Does a shallow clone but maintains DOM references. Using a map rather than DOM elements in the event flow is an FP solution - do this at some point. */
const _clone = obj => {
	return Object.assign({}, obj);
};

const _componentDetails = el => {
	let rootNode = _getRootNode(el);
	return _getComponentDetails(rootNode);
};

const _composedPath = (e) => {
	// Needed for unsupported browsers, like old Edge.
	if (!e.composedPath) {
		if (e.path) {
			return e.path;
		} 
		let target = e.target;
		let path = [];
		while (target.parentNode !== null) {
			path.push(target);
			target = target.parentNode;
		}
		path.push(document, window);
		return path;
	} else {
		return e.composedPath();
	}
};

const _condDefSelf = cond => CONDDEFSELF.indexOf(cond.replace(/not\-/, '')) !== -1;

const _convertToMS = (tim, errMess) => {
	if (tim == 'stack' || tim == '0') return 0;
	var match = /^(\d+)(s|ms)?$/i.exec(tim);
	if (!match) _err(errMess);
	var n = parseFloat(match[1]);
	var type = (match[2] || 'ms').toLowerCase();
	return (type == 's') ? n * 1000 : n;
};

const _countPlaces = num => {
	// Counts the number of decimal places and returns it.
    let str = num.toString();
    let pos = str.indexOf('.');
    return (pos == -1) ? 0 : (str.length - pos - 1);
};

ActiveCSS._decodeHTML = str => {
	// This is use in the mimic command to work with updating the title. It's not the same as _escapeItem().
	let doc = new DOMParser().parseFromString(str, 'text/html');
	return doc.documentElement.textContent;
};

const _doDebug = (typ, primSel) => {
	if (primSel) {
		if (debugMode.indexOf(':') !== -1) {
			let a = primSel.split(':');
			return (debugMode.indexOf(a[0] + ':' + typ) !== -1);
		} else {
			return (debugMode.indexOf(primSel) !== -1 || debugMode.indexOf(typ) !== -1);
		}
	} else {
		if (debugMode.indexOf(':') !== -1) {
			return (debugMode.indexOf(typ) !== -1 && debugMode.indexOf(':') !== debugMode.indexOf(typ) - 1);
		} else {
			return (debugMode.indexOf(typ) !== -1);
		}
	}
};

const _eachRemoveClass = (inClass, classToRemove, doc, scope='') => {
	doc.querySelectorAll(scope + ' .' + inClass + ((scope !== '') ? ',' + scope + '.' + inClass : '')).forEach(function (obj, index) {
		if (!obj) return; // element is no longer there.
		ActiveCSS._removeClassObj(obj, classToRemove);
	});
};

const _err = (str, o, ...args) => {	// jshint ignore:line
	// Throw involved error messages when using the development edition, otherwise for security reasons throw a more vague error which can be debugged by
	// using the development edition. If converting for the browser, this would get a special command like "debug-show-messages: true;" or something like
	// that. It is unnecessary to require that for the JavaScript version of the core, as we differentiate between development and production versions.
	if (DEVCORE) {
		_errDisplayLine('Active CSS breaking error', str, [ 'color: red' ], o, args);	// jshint ignore:line
		throw 'error, internal stack trace -->';
	} else {
		throw 'ACSS error: ' + str;
	}
};

const _errDisplayLine = (pref, message, errStyle, o, argsIn) => {	// jshint ignore:line
	let newArgs, args;
	if (argsIn.length > 0) {
		newArgs = ['More info:', ...argsIn];
		args = Array.prototype.slice.call(newArgs);
	}
	message = '%c' + pref + ', ' + message;
	if (o) {
		message += ' --> "' + o.actName + ': ' + o.actVal + ';"';
		message += (o.file.startsWith('_inline_')) ? '    (embedded ACSS)' : '    (line ' + o.line + ', file: ' + o.file + ')';
	}
	console.log(message, errStyle);
	if (args) console.log.apply(console, args);
	if (o) console.log('Target:', o);
	console.log('Config:', config);
	console.log('Variables:', scopedOrig);
	if (conditionals.length > 0) console.log('Conditionals:', conditionals);
	if (components.length > 0) console.log('Components:', components);
};

const _escapeInnerQuotes = str => {
	// This sorts out any errant unentitied double-quotes than may be within other double-quotes in tags.
	const reg = /( [\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+\=\")/;

	let newStr = str.replace(/(<\s*[\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+[^>]*>)/gm, function(_, wot) {
		wot = wot.replace(/\\"/gm, '____acssEscQuo');
		let arr = wot.split(reg), newStr = '', i, pos, numQuo;
		let arrLen = arr.length;

	    for (i = 0; i < arrLen; i++) {
	    	let checkSplitStr = arr[i].indexOf('="');
    		if (i > 0 && checkSplitStr !== -1 && arr[i - 1].slice(-1) != '"' && arr[i - 1].indexOf('<') === -1) {
				// Replace all quotes, as this item is in the middle of a quoted string.
				newStr += arr[i].replace(/"/gm, '&quot;');
			} else if (checkSplitStr !== -1 || arr[i].indexOf('"') === -1) {
				// This doesn\'t need anything doing to it. This needs to be after the last condition to work.
				newStr += arr[i];
			} else {
				// Replace all quotes.
				let tmpStr = arr[i].replace(/"/gm, '&quot;');
				// Put back the last one.
				pos = tmpStr.lastIndexOf('&quot;');
				newStr += tmpStr.substring(0, pos) + '"' + tmpStr.substring(pos + 6);
			}
		}

		return newStr;
	});
	newStr = newStr.replace(/____acssEscQuo/gm, '"');	// This replaces the escaped quote with a regular quote. It's used prior to rendering.

	// Put escaped backslashes back that were set up in _resolveVars.
	newStr = newStr.replace(/____acssEscBkSl/gm, '\\');	// This replaces the escaped quote with a regular quote. It's used prior to rendering.

	return newStr;
};

const _escapeQuo = str => {
	return str.replace(/"/g, '\\"');
};

function _escCommaBrack(str, o) {
	/**
	 * "o" is used for reporting on any failing line in the config.
	 * There is no recursive facility like there is in PCRE for doing the inner bracket recursion count, so doing it manually as the string should be relatively
	 * small in pretty much all cases.
	 * Here is an old-school method unless someone has a better idea. Though when JavaScript finally gets a recursive option, it can be converted to a regex.
	 * String could be this (note the double enclosure - there could be many enclosure levels), so it needs to work in all cases:
	 * player "X",gameState ['', '', ''],roundDraw false,winners [[0, 1, 2],[3, [2, 3, 4], 4, 5],[6, 7, 8],[0, 4, 8],[2, 4, 6]],testvar ",[,],",testvar2 ',[,],'
	 * It needs to convert to this:
	 * player "X",gameState [''__ACSScom ''__ACSScom ''],roundDraw false,winners [[0__ACSScom 1__ACSScom 2]__ACSScom[3__ACSScom [2__ACSScom 3__ACSScom 4]__ACSScom 4__ACSS
com 5]__ACSScom[6__ACSScom 7__ACSScom 8]__ACSScom[0__ACSScom 4__ACSScom 8]__ACSScom[2__ACSScom 4__ACSScom 6]],testvar "__ACSScom[__ACSScom]__ACSScom",testvar2 '__ACSS
com[__ACSScom]__ACSScom'
	 * Easy solution:
	 * 1. Escape any commas in quotes or double quotes.
	 * 2. Split the array by comma.
	 * 3. Iterate the array.
	 * 4. Count the number of brackets, curlies and parentheses in any one item.
	 * 5. If the balance count does not equal or has not resolved to 0, then add the array item plus an escaped comma, to the new string. Otherwise add a real comma.
	 * 6. Carry the balance count over and repeat from 3.
	 * 8. Put back any escaped quotes.
	 * 9. Do any final replacements for the looping of the o.actVal.
	 * 10. Return the new string.
	*/
	// Replace escaped double quotes.
	str = str.replace(/\\\"/g, '_ACSS_i_dq');
	// Replace escaped single quotes.
	str = str.replace(/\\'/g, '_ACSS_i_sq');
	// Ok to this point.
	let mapObj = {
		'\\,': '__ACSS_int_com',
		'\\(': '_ACSS_i_bo',
		'\\)': '_ACSS_i_bc',
		'\\{': '_ACSS_i_co',
		'\\}': '_ACSS_i_cc',
		'\\[': '_ACSS_i_so',
		'\\]': '_ACSS_i_sc'
	};
	let mapObj2 = {
		',': '__ACSS_int_com',
		'(': '_ACSS_i_bo',
		')': '_ACSS_i_bc',
		'{': '_ACSS_i_co',
		'}': '_ACSS_i_cc',
		'[': '_ACSS_i_so',
		']': '_ACSS_i_sc'
	};
	str = str.replace(/("([^"]|"")*")/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards, mapObj2);
	});
	str = str.replace(/('([^']|'')*')/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards, mapObj2);
	});
	let strArr = str.split(','), balanceCount = 0, newStr = '', item;
	for (item of strArr) {
		balanceCount += item.split('[').length - item.split(']').length;
		balanceCount += item.split('(').length - item.split(')').length;
		balanceCount += item.split('{').length - item.split('}').length;
		newStr += (balanceCount !== 0) ? item + '__ACSS_int_com' : item + ',';
	}
	if (balanceCount !== 0) {
		// Syntax error - unbalanced expression.
		newStr = _escCommaBrackClean(newStr, mapObj2);
		newStr = newStr.replace(/__ACSS_int_com/g, ',');
		_err('Unbalanced JavaScript equation in var command - too many brackets, curlies or parentheses, or there could be incorrectly escaped characters: ' + newStr, o);
		return newStr;
	} else {
		// Remove the last comma
		newStr = newStr.slice(0, -1);
		// Set up the correct formatting for looping the o.actVal.
		newStr = newStr.replace(/\,/g, '_ACSSComma');

	}
	newStr = _escCommaBrackClean(newStr);
	return newStr;
}

function _escCommaBrackClean(str, mapObj2) {
	// A simple reverse of the object won't give use the regex options we want, so just do a new replace object.
	let mapObj = {
		'_ACSS_i_dq': '\\"',
		'_ACSS_i_sq': "\\'",
		'__ACSS_int_com': ',',
		'_ACSS_i_bo': '(',
		'_ACSS_i_bc': ')',
		'_ACSS_i_co': '{',
		'_ACSS_i_cc': '}',
		'_ACSS_i_so': '[',
		'_ACSS_i_sc': ']'
	};

	str = str.replace(/("([^"]|"")*")/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});
	str = str.replace(/('([^']|'')*')/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});
	return str;
}

// Not the same as the lodash one, but similar.
const _escForRegex = str => {
	return str.replace(REGEXCHARS, '\\$&');
};

const _escInQuo = (str, chrRaw, chrRepl) => {
	let chrReg = _escForRegex(chrRaw);
	let replReg = new RegExp(chrReg, 'g');
	str = str.replace(/"(.+?)"/g, function(_, innards) {
		innards = '"' + innards.replace(replReg, chrRepl) + '"';
		return innards;
	});
	return str;
};

const _escNoVars = str => {
	return (typeof str === 'string') ? str.replace(/\{/gim, '__ACSSnoVarsOpCurly').replace(/\}/gim, '__ACSSnoVarsClCurly') : str;
};

const _evalDetachedExpr = (valToExpr, varScope) => {
	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	const expr = '{=' + valToExpr + '=}';
	return _replaceJSExpression(expr, true, false, varScope, -1);	// realVal=true, quoteIfString=false, varReplacementRef=-1
};

const _extractActionPars = (actionValue, parArr, o) => {
	// Extracts bracket parameters from an action value and returns an object with separated values.
	// Used in take-class, and designed to be used by others.
	// It can handle inner brackets for selectors with pseudo-selectors like :not().
	// The "o" is only used for reporting errors.
	// actionValue = the full action command value.
	// parArr = an array of parameter names that has content in parentheses, eg. [ 'scope', 'something' ].
	// Example:
	// my-command: .myClass scope(#myScope:not(.cheese)) something(some command string);
	// Should return this: { action: '.myClass', scope: '#myScope:not(.cheese)', something: 'some command string' }

	let newActionValue = actionValue;
	let res = {}, pos, parStartLen, splitRes;

	// Escape any escaped parentheses or in quotes so they don't factor into the parentheses splitting that is about to take place.
	newActionValue = newActionValue.replace(/\\\(/g, '_ACSS_opPa').replace(/\\\)/g, '_ACSS_clPa');
	newActionValue = _escInQuo(newActionValue, '(', '_ACSS_opPa');
	newActionValue = _escInQuo(newActionValue, ')', '_ACSS_clPa');

	parArr.forEach(parName => {
		// Note this was further abstracted out, but would have been slower with the char escaping going on above happening within the abstraction,
		// so I put it back to this for the sake of speed.
		let currentActionValue = newActionValue;
		pos = newActionValue.indexOf(parName + '(');
		if (pos !== -1) {
			parStartLen = parName.length + 1;	// Includes name of parameter and first parenthesis.
			newActionValue = currentActionValue.substr(0, pos - 1).trim();		// Strips off the parameters as it goes.
			// Get the parameter value and the remainder of the action value.
			// Send over the action value from the beginning of the parameter value.
			splitRes = _extractActionParsSplit(currentActionValue.substr(pos + parStartLen), actionValue, o);
			res[parName] = _extractActionParsUnEsc(splitRes.value);
			newActionValue += splitRes.remainder;
		}
	});
	res.action = _extractActionParsUnEsc(newActionValue);	// The action is what is left after the parameter loop.

	return res;
};

const _extractActionParsUnEsc = str => {
	return str.replace(/_ACSS_opPa/g, '\\(').replace(/_ACSS_clPa/g, '\\)');
};

const _extractActionParsSplit = (str, original, o) => {
	// Example of str content:
	// str = "#left) another(#myEl:not(has(something))) hi(and the rest) something"
	// We have already accounted for the opening parenthesis.
	// Return value should be:
	// res.value = "#left";
	// res.remainder = " another(#myEl:not(has(something))) hi(and the rest) something"

	let res = {};
	// Split by "(".
	let openingArr = str.split('(');
	if (openingArr.length == 1) {
		// No "(" found - there should be only one parameter.
		let closingPos = str.indexOf(')');
		if (closingPos === -1) {
			_err('No closing parenthesis found for parameter in action command', o);
		}
		res.value = str.substr(0, closingPos).trim();
		res.remainder = str.substr(closingPos + 1);
	} else {
		let lineCarry = '', line, innerRes, remainderArr;
		for (let n = 0; n < openingArr.length; n++) {
			line = openingArr[n];
			// Now get the content of this line sorted out.
			innerRes = _extractActionParsInner(line, n + 1, original, o);
			if (innerRes.value) {
				// We got the variable that we needed.
				res.value = lineCarry + innerRes.value;
				res.remainder = innerRes.remainder;
				if (n < openingArr.length) {
					remainderArr = openingArr.slice(n + 1);
					res.remainder += (typeof remainderArr[0] !== undefined && remainderArr[0] != '' ? '(' : '') + remainderArr.join('(');
				}
				break;
			}
			lineCarry += line + '(';
		}

	}

	return res;
};

const _extractActionParsInner = (str, numOpening, original, o) => {
	// Split by ')'.
	let closingArr = str.split(')');
	if (closingArr.length - 1 > numOpening) {
		_err('Too many closing parenthesis found in action command', o);
	} else if (closingArr.length - 1 < numOpening) {
		// Not enough closing parameters. Return an empty object without a value.
		return {};
	} else {
		// We have the right number of closing parentheses.
		let res = {};
		res.remainder = closingArr.slice(-1);
		res.value = closingArr.slice(0, -1).join(')');
		return res;
	}
};

const _fade = o => {
	/***
	 * Work out which function called this and then call the generic function which can be kept separate to this to help split up actual functionality.
	 *
	 * fade-in *el* *duration* *displayValue*
	 * fade-out *el* *duration* [no-hide]
	 * fade-to *el* *duration* *toOpacity* *displayValue*
	 *
	 * duration = (number)(ms or s).
	 * toOpacity = (number).
	 * displayValue = optional - last value if it isn't duration or opacity - don't need to qualify it further so we keep forward compatibility.
	 * no-hide = optional - do not set the display none at the end of the fade-out.
	 * complete-then-hide = optional - do not set the display none at the end of the fade-out until the duration has completed for all in selection.
	 * el = the remainder.
	 * An easy and performant way to do this is to split o.actVal by space and work it from the back to the beginning.
	 * Last thing is to call the _fadeDo with the appropriate options.
	 *
	 * fade-in = _fadeDo(el, duration, o.func, undefined, "initial" or displayValue);
	 * fade-out = _fadeDo(el, duration, o.func);
	 * fade-to = it depends which way it is fading - see code below.
	**/

	let actValArr = o.actVal.split(' ');
	let actValArrLen = actValArr.length, i;
	let sel, duration, toOpacity, displayValue, noDisplayNone, waitDisplayNone, selArr;
	// Working backwards through the space-delimited array of the command.
	for (i = actValArrLen - 1; i > -1; i--) {
	    if (!toOpacity && _isPositiveFloat(actValArr[i])) {
		    // This is a number, which indicates it should be toOpacity.
		    if (actValArr[i] < 0 || actValArr[i] > 1) _err('Invalid fading opacity number:', o, actValArr[i]);
		    toOpacity = actValArr[i];
	    } else if (!duration && _isPositive(actValArr[i][0])) {
		    // This starts with a number so this should be the duration parameter. Display values don't start with a number.
		    duration = _convertToMS(actValArr[i], 'Invalid fading delay: ' + actValArr[i]);
		} else if (o.func == 'FadeOut' && actValArr[i] == 'no-hide') {
			noDisplayNone = true;
		} else if (o.func == 'FadeOut' && actValArr[i] == 'complete-then-hide') {
			waitDisplayNone = true;
		} else if (!displayValue && i == actValArrLen - 1) {
			// This is the last in the array (the first hit in the loop) and if it gets this far on the first iteration then it's a display value.
			displayValue = actValArr[i];
	    } else {
	    	// We can break out at this point - removing the previous items found so we can join up the rest of the array to form the selector.
	    	// it will work if the syntax is correct or it will break if the syntax is wrong.
	    	actValArr.splice(i + 1);
			// Join up what's left as this should be the selector.
			sel = actValArr.join(' ').trim();
			if (!sel) _err('Invalid fading selector:', o, sel);
	    	break;
	    }
	}

	// Set the display value if it isn't set. This won't be used for fade-out, which always ends up with a display of "none".
	if (!displayValue && o.func != 'FadeOut') displayValue = 'initial';

	let func, objs;
	if (!sel) {
		// Use the target selector if there is no selector specified.
		if (typeof o.secSelObj === 'object') objs = [ o.secSelObj ];
	} else {
		objs = _getSels(o, sel);
	}
	if (!objs) return false;	// invalid target.
	objs.forEach(function (obj) {
		func = _fadeGetFunc(obj, o.func, toOpacity, o);
		if (func) _fadeDo(obj, duration, func, toOpacity, displayValue, noDisplayNone, waitDisplayNone, o);
	});
};

const _fadeGetFunc = (el, funcIn, toOpacity, o) => {
	let funcOut = funcIn;
	let existingOpac;
	let computedStylesEl = window.getComputedStyle(el);
	if (!el.style.opacity) {
		el.style.opacity = computedStylesEl.opacity;
		existingOpac = el.style.opacity;
	}
	if (computedStylesEl.display == 'none') {
		el.style.opacity = 0;
	}
	if (funcIn == 'FadeTo') {
		let existingOpac = el.style.opacity;
		if (existingOpac > toOpacity) {
			funcOut = 'FadeOut';
		} else if (existingOpac == toOpacity) {
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
			return;
		}
	}
	return funcOut;
};

const _fadeDo = (el, duration, func, toOpac, displayValue, noDisplayNone, waitDisplayNone, o) => {
	// If this function starts getting overly complicated then split out FadeOut functionality and put into a separate function.
	// It doesn't need that level of engineering currently though as it's still maintainable and keeps the general animation all together in one place.
	var last = +new Date();
	var Tracker = last;
	var StartingLast = last;
	el._acssMidFade = Tracker;
	let computedStylesEl = window.getComputedStyle(el);
	let elStartingOpac = el.style.opacity;
	toOpac = (toOpac) ? toOpac : (func == 'FadeOut') ? 0 : 1;

	// Adjust the duration which now needs to be based on the fraction rather than 1 or 0 as we're using the time technique below.
	// The end result is the same as using a purely duration based technique.
	if (elStartingOpac != toOpac) {
		// Get the current difference between the opacities as a positive number.
		let difference = elStartingOpac > toOpac ? elStartingOpac - toOpac : toOpac - elStartingOpac;
		// Adjust the duration according to the time distance that will be travelled.
		duration = (1 / difference) * duration;
	}

	if (func != 'FadeOut') {
		if (el.style.display == 'none') {
			el.style.opacity = 0;
		}
		el.style.display = displayValue;
	}

	var tick = (timeStamp, noChange=false) => {
		// Skip out if the element is no longer on the page or if this fading event should be halted.
		if (!el || !_isConnected(el) || el._acssMidFade != Tracker) return;
		var amount = (new Date() - last) / duration;
		if (noChange !== true) el.style.opacity = (func == 'FadeOut') ? +el.style.opacity - amount : +el.style.opacity + amount;
		last = +new Date();
		if (func == 'FadeOut' && +el.style.opacity > toOpac || func != 'FadeOut' && +el.style.opacity < toOpac) {
			requestAnimationFrame(tick);
		} else if (waitDisplayNone && last - StartingLast < duration) {
			requestAnimationFrame(() => tick(undefined, true));
		} else {
			if (func == 'FadeOut' && toOpac == 0) {
				if (!noDisplayNone) el.style.display = 'none';
				el.style.opacity = 0;
			} else {
				el.style.opacity = toOpac;
			}
			delete el._acssMidFade;
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
		}
	};

	tick();
};

const _fullscreenDetails = () => {
	let arr;
	if ('MSGesture' in window) {
		/* Edge weirdness */
		arr = [document.webkitFullscreenElement, 'webkit'];
	} else {
		arr = [document.fullscreenElement, ''];
	}
	return arr;
};

const _getActiveID = obj => {
	if (!obj.isConnected) {
		return _getTempActiveID(obj);
	}
	if (obj) {
		if (!obj._acssActiveID) {
			activeIDTrack++;
			let fullID = 'id-' + activeIDTrack;
			obj._acssActiveID = fullID;
			idMap[fullID] = obj;
		}
		return obj._acssActiveID;
	}
	return false;
};

const _getAttrOrProp = (el, attr, getProp, ind=null, func='') => {
	let ret, isRender = func.startsWith('Render');

	if (!getProp) {
		// Check for attribute.
		ret = (ind) ? el.options[ind].getAttribute(attr) : el.getAttribute(attr);
		if (ret) return ret;
		// Check for property next as fallback.
	}
	// Check for property.
	ret = (ind) ? el.options[ind][attr] : el[attr];
	if (ret && typeof ret == 'string') {
		let newRet = ret.replace(/\\/gm, '\\\\');
		return (isRender) ? _escapeItem(newRet) : newRet;	// properties get escaped as if they are from attributes.
	}
	return '';
};

/**
 * Takes in a full URL or string and returns everything up to the "?" if it exists
 *
 * Called by:
 *	_a.LoadScript()
 *	ActiveCSS.init()
 *	_addActValRaw()
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} str: String containing full URL.
 *
 * @returns the string before the "?" or the original string if there is no "?"
 */
const _getBaseURL = str => {
	let pos = str.indexOf('?');
	return (pos !== -1) ? str.substr(0, str.indexOf('?')) : str;
};

const _getComponentDetails = rootNode => {
	let rootNodeHost;
	if (!rootNode.isSameNode(document)) {
		// Get the component variables so we can run this element's events in context.
		rootNodeHost = rootNode;
		if (supportsShadow && rootNode instanceof ShadowRoot) {
			rootNodeHost = rootNode.host;
		}
		return {
			component: rootNodeHost._acssComponent,
			compDoc: rootNode,
			varScope: rootNodeHost._acssVarScope,
			evScope: rootNodeHost._acssEvScope,
			strictPrivateEvs: rootNodeHost._acssStrictPrivEvs,
			privateEvs: rootNodeHost._acssPrivEvs,
			strictVars: rootNodeHost._acssStrictVars,
			topEvDoc: rootNodeHost._acssTopEvDoc,
			inheritEvDoc: rootNodeHost._acssInheritEvDoc
//			compHost: rootNodeHost._acssHost
		};
	} else {
		return {
			component: null,
			compDoc: null,
			varScope: null,
			evScope: null,
			strictPrivateEvs: null,
			privateEvs: null,
			strictVars: null,
			topEvDoc: null,
			inheritEvDoc: null
//			compHost: null
		};
	}
};

const _getComponentRoot = (obj) => {
	// This gets the root of the component - either a scoped host or a shadow DOM rootNode.
	let scopedHost = (obj.parentElement && (!supportsShadow || supportsShadow && !(obj.parentNode instanceof ShadowRoot))) ? obj.parentElement.closest('[data-active-scoped]') : false;
	let rootNode = obj.getRootNode();
	if (!scopedHost && rootNode.isSameNode(document)) {
		// There is no component that contains this element.
		return document;
	} else if (!scopedHost) {
		// This element must be in a shadow root.
		return rootNode;
	} else {
		// If it's gotten this far, then there is a scoped component involved.
		if (scopedHost && rootNode.isSameNode(document)) {
			// This has to be a scoped component.
			return scopedHost;
		} else {
			// If it has gotten this far, there is both a scoped component and a shadow component above this element. It won't be in the document.
			// But which component is this element really in?
			// If the shadow root contains the same exact scoped component, then the element is in the scoped component, as it is lower in the DOM tree.
			// If the shadow root does not contain the same exact scoped component, then the element must be in the shadow root, as it is lower in the DOM tree.
			// Make sure we check on the exact same scoped component, so we need the activeid for this.
			return (idMap[scopedHost._acssActiveID]) ? scopedHost : rootNode;
		}
	}
};

const _getFieldValType = obj => {
	switch (obj.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			return 'value';
		default:
			return 'innerText';
	}
};

const _getFocusedOfNodes = (sel, o, startingFrom='') => {
	// Find the current focused node in the list, if there is one.
	let res, nodes, obj, i = -1, useI = -1, checkNode;
	res = _getSelector(o, sel, true);
	if (!res) return false;	// invalid target.
	checkNode = (startingFrom !== '') ? _getSel(o, startingFrom) : (res.doc.activeElement) ? res.doc.activeElement : (res.doc.ownerDocument) ? res.doc.ownerDocument.activeElement : false;
	if (!checkNode) return -1;
	nodes = res.obj || null;
	for (obj of nodes) {
		i++;
		if (obj.isSameNode(checkNode)) {
			useI = i;
			break;
		}
	}
	return [ nodes, useI ];
};

const _getNumber = str => {
	let val = parseFloat(str);
	let num = str - val + 1;
	return (num >= 0) ? val : false;
};

const _getPageFromList = hrf => {
	// Wildcard or straight href retrieval from pageList. This needs to be really fast as it can run on mouseovers.
	let pageItem, checkHrf;

	// This is still needed. It checks to see if there is an exact match first. This could possibly be further optimized.
	pageItem = pageList.find(item => item.url === hrf);

	if (!pageItem) {
		// Iterate wildcards regexes to find a match.
		let wildLen = pageWildcards.length, n, wild, mapArr;
		for (n = 0; n < wildLen; n++) {
			wild = pageWildcards[n];
			// Get the page to check, run it through the wildcard regex, and replace each wildcard match with *.
			// If the resultant string is totally empty, we have a match.
			mapArr = [];
			checkHrf = hrf;
			checkHrf = checkHrf.replace(wild.regex, function(_, innards) {	// jshint ignore:line
				// This the wildcard inner * match. Push the replacement for * into variables so they can substituted into {$1}, {$2}, etc. right after this.
				mapArr.push(innards);
				return '';
			});
			if (checkHrf !== '') continue;	// wasn't a match - check the next one.

			// And as if by magic, we now have an array of variables we can replace in the attributes.
			// Replace any variables mentioned in the attrs string from @pages.
			let targetAttrs = wild.attrs, mapArrLen = mapArr.length, varMatch, i;
			for (i = 0; i < mapArrLen; i++) {
				if (pageWildReg[i] === undefined) {
					// For speed, only create the var match regex when it is needed. We don't know how many we might need, but no point it twice.
					pageWildReg[i] = new RegExp('\\{\\$' + (i + 1) + '\\}', 'g');
				}
				targetAttrs = targetAttrs.replace(pageWildReg[i], mapArr[i]);
			}
			pageItem = { url: hrf, attrs: targetAttrs };
			break;
		}
	}

	return pageItem;
};

const _getPastFutureDate = str => {
	// Accepts a string representing a time frame in the past or future, like "3 months", "-3 months", "+3months", or "month" and returns it as a date.

	let more = 1, expires;
	// Remove the number from the string with the + or -, if it is indeed there.
	let timeFrameType = str.replace(/^([\+|\-]?[\d\.]+)/, function(_, innards) {
		more = innards * 1;	// This just converts the string to a number.
		return '';			// Strip the number out of the line if it was found.
	}).trim();				// Remove any remaining whitespace.
	// Now we have the number and the time frame type.

	// Remove any presence of "s" from the time frame and make it all lowercase so we have a simpler switch statement.
	timeFrameType = timeFrameType.replace(/s/g, '').toLowerCase().trim();
	let nowDate = new Date();
	switch (timeFrameType) {
		case 'year':
			expires = nowDate.setFullYear(nowDate.getFullYear() + more);
			break;
		case 'month':
			expires = nowDate.setMonth(nowDate.getMonth() + more);
			break;
		case 'day':
			expires = nowDate.setHours(nowDate.getHours() + (more * 24) );
			break;
		case 'hour':
			expires = nowDate.setHours(nowDate.getHours() + more);
			break;
		case 'minute':
			expires = nowDate.setHours(nowDate.getHours() + more);
			break;
		case 'econd':	// Second. We stripped off the "s" earlier.
			expires = nowDate.setSeconds(nowDate.getSeconds() + more);
			break;
		default:
			expires = null;
	}
	return (!expires) ? null : new Date(expires);
};

const _getRealEvent = ev => {
	let first5 = ev.substr(0, 5);
	if (first5 == 'after' && ev != 'afterprint') {	// This is a Active CSS only event, so we don't want to add an event listener.
		return false;
	} else if (first5 == 'keyup') {
		ev = 'keyup';
	} else if (ev.substr(0, 7) == 'keydown') {
		ev = 'keydown';
	} else if (ev == 'fullscreenEnter' || ev == 'fullscreenExit') {		// Active CSS only events.
		ev = _fullscreenDetails()[1] + 'fullscreenchange';		// Active CSS only events.
	} else {
		if (['draw', 'observe', 'disconnectCallback', 'adoptedCallback', 'attributeChangedCallback', 'beforeComponentOpen', 'componentOpen'].includes(ev)) return false;	// custom Active CSS events.
		if (ev.substr(0, 10) == 'attrChange') return false;	// custom Active CSS event attrChange(Attrname). We need to do this to avoid clash with custom event names by user.
	}
	return ev;
};

const _getRootNode = obj => {
	if (!supportsShadow) {
		// Either this element is in a scoped component, or it is in the document. It's a simple check.
		return _getScopedRoot(obj) || document;
	} else {
		// Either this element is in a scoped component, a shadow DOM component, or the document, so it needs a more thorough check.
		return _getComponentRoot(obj);
	}
};

const _getScopedRoot = (obj) => {
	return (obj.parentNode) ? obj.parentNode.closest('[data-active-scoped]') : null;		// Should return null if no closest scoped component found.
};

const _getSel = (o, sel, many=false) => {
	let res = _getSelector(o, sel, many);
	return res.obj || false;
};

const _getSelector = (o, sel, many=false) => {
	let newDoc;
	if (o.compDoc) {
		// Use the default shadow doc. This could be a componentOpen, and unless there's a split selector involved, we need to default to the shadow doc provided.
		newDoc = o.compDoc;
		if (newDoc && newDoc.nodeType !== Node.DOCUMENT_NODE) {
			let compDetails = _getComponentDetails(newDoc);
			newDoc = compDetails.topEvDoc;
			if (compDetails.inheritEvDoc) {
				let checkPrimSel = (o.primSel && o.primSel.startsWith('~') && o.origO && o.origO.primSel) ? o.origO.primSel : o.primSel;
				if (!o.component || !checkPrimSel || checkPrimSel.indexOf('|' + o.component + ':') === -1) {
					newDoc = compDetails.inheritEvDoc;
				}
			}
		}
	} else {
		newDoc = o.doc || document;
	}
	if (sel.startsWith('~')) {
		return { doc: newDoc, obj: sel };
	}

	// This is a consolidated selector grabber which should be used everywhere in the core that needs ACSS special selector references.
	let item = false;

	// In order not to break websites when CSS gets enhanced, it's necessary to take full responsibility for the special ACSS selectors and deal with
	// them internally so that native behaviour doesn't change things later.

	// Escape any &, < or ... that are in double-quotes. These will need to be individually unescaped at each iteration that uses a queryselector.
	let newSel = sel.replace(/("(.*?)")/g, function(_, innards) {
		innards = innards.replace(/&/g, '_acss*a t*')
			.replace(/\-\>/g, '_acss*s*i n')
			.replace(/</g, '_acss*s*l s')
			.replace(/me/g, '_acss*s*m e')
			.replace(/this/g, '_acss*s*t h')
			.replace(/self/g, '_acss*s*s e');
		return innards;
	});

	let attrActiveID, n, selItem, compDetails, elToUse;
	let obj = o.secSelObj || o.obj;

	let thisObj = false;
	if ((
			newSel.indexOf('&') !== -1 ||
			/\bself\b/.test(newSel) ||
			/\bme\b/.test(newSel) ||
			/\bthis\b/.test(newSel)
			) && (typeof obj === 'object')
		) {
		elToUse = obj;
		attrActiveID = _getActiveID(elToUse);

		// Add the data-activeid attribute so we can search with it. We're going to remove it after. It keeps it all quicker than manual DOM traversal.
		elToUse.setAttribute('data-activeid', attrActiveID);
		let repStr = '[data-activeid=' + attrActiveID + ']';
		if (newSel.indexOf('&') !== -1) newSel = newSel.replace(/&/g, repStr);
		if (newSel.indexOf('self') !== -1) newSel = newSel.replace(/\bself\b/g, repStr);
		if (newSel.indexOf('me') !== -1) newSel = newSel.replace(/\bme\b/g, repStr);
		if (newSel.indexOf('this') !== -1) newSel = newSel.replace(/\bthis\b/g, repStr);
		thisObj = true;
	}

	// The string selector should now be fully iterable if we split by " -> " and "<".
	let selSplit = newSel.split(/( \-> |<)/);
	if (selSplit.length == 1 && thisObj) {
		return { doc: newDoc, obj: (many ? [ obj ] : obj) };
	}
	let mainObj = obj;

	let selSplitLen = selSplit.length;
	let selectWithClosest = false;
	let justFoundIframe = false;
	let singleResult = false;
	let multiResult = false;
	let justSetIframeAsDoc = false;

	for (n = 0; n < selSplitLen; n++) {
		selItem = unescForSel(selSplit[n]);

		if (justFoundIframe !== false && selItem == ' -> ') {
			// We are drilling into an iframe next.
			newDoc = justFoundIframe;
			justFoundIframe = false;
			justSetIframeAsDoc = true;
			continue;
		} else {
			justFoundIframe = false;
		}
		singleResult = false;
		multiResult = false;
		switch (selItem) {
			case 'window':
				mainObj = window;
				newDoc = document;
				singleResult = true;
				break;

			case 'body':
				mainObj = (justSetIframeAsDoc) ? newDoc.body : document.body;
				newDoc = (justSetIframeAsDoc) ? newDoc : document;
				singleResult = true;
				break;

			case 'document':	// Special ACSS selector
			case ':root':	// Special ACSS selector
				newDoc = (justSetIframeAsDoc) ? newDoc : document;
				mainObj = newDoc;
				singleResult = true;
				break;

			case 'shadow':		// Special ACSS selector
				if (mainObj) newDoc = mainObj.shadowRoot;
				mainObj = newDoc;
				singleResult = true;
				break;

			case 'parent':		// Special ACSS selector
				// Get object root details.
				compDetails = _getComponentDetails(o.compDoc);
				if (!newDoc.isSameNode(compDetails.topEvDoc)) {
					newDoc = compDetails.topEvDoc;
				} else if (window.parent.document) {
					newDoc = window.parent.document;
				}
				mainObj = newDoc;
				singleResult = true;
				break;

			case 'host':		// Special ACSS selector
			case ':host':
				compDetails = _getComponentDetails(o.compDoc);
				if (['beforeComponentOpen', 'componentOpen'].indexOf(o.event) !== -1) {
					// The host is already being used as the target selector with these events.
				} else {
					let rootNode = _getRootNode(mainObj.length == 1 ? mainObj[0] : mainObj);
					mainObj = (rootNode._acssScoped) ? rootNode : rootNode.host;
				}
				singleResult = true;
				break;

			case ' -> ':
				break;

			case '<':
				selectWithClosest = true;
				continue;

			default:
				if (selectWithClosest) {
					// Get closest nextSel to the current element, but we want to start from the parent. Note that this will always only bring back one node.
					if (mainObj) mainObj = (mainObj.length == 1 ? mainObj[0] : mainObj).parentElement;
					if (!mainObj) break;
					mainObj = mainObj.closest(selItem);
					singleResult = true;
				} else {
					try {
						mainObj = newDoc.querySelectorAll(selItem);
						if (!mainObj) {
							if (newDoc.nodeType !== Node.DOCUMENT_NODE) {
								if (newDoc.matches(selItem)) {
									mainObj = newDoc;
								}
							}
						}
							
					} catch(err) {
						if (attrActiveID) elToUse.removeAttribute('data-activeid');
						return { obj: undefined, newDoc };
					}
					multiResult = true;
				}
				if (justFoundIframe === false) {
					if (mainObj && mainObj.length == 1 && mainObj[0].tagName == 'IFRAME') {
						justFoundIframe = mainObj[0].contentWindow.document;
						continue;
					}
				}
				justFoundIframe = false;
		}
		// Reset closest flag so it only happens the once.
		selectWithClosest = false;
		justSetIframeAsDoc = false;
	}

	let res = { doc: newDoc }, done;
	if (many) {
		if (singleResult) {
			res.obj = [ mainObj ];
			done = true;
		}
	} else {
		if (multiResult) {
			res.obj = mainObj[0];
			done = true;
		}
	}
	if (!done) res.obj = mainObj;

	if (attrActiveID) elToUse.removeAttribute('data-activeid');

	function unescForSel(sel) {
		let newSel = sel.replace(/("(.*?)")/g, function(_, innards) {
			innards = innards.replace(/_acss\*a t\*/g, '&')
				.replace(/_acss\*s\*i n/g, '->')
				.replace(/_acss\*s\*l s/g, '<')
				.replace(/_acss\*s\*m e/g, 'me')
				.replace(/_acss\*s\*t h/g, 'this')
				.replace(/_acss\*s\*s e/g, 'self');
			return innards;
		});
		return newSel;
	}

	return res;
};

const _getSels = (o, sel) => _getSel(o, sel, true);	// true = many objects

const _getTempActiveID = obj => {
	// This is used before a component is drawn for real. It is needed as the output starts off in string form, and when added to the page the attribute is removed
	// and a real internal value gets assigned.
	if (obj && obj.dataset) {
		if (!obj.dataset.activeid) {
			activeIDTrack++;
			obj.dataset.activeid = 'id-' + activeIDTrack;
		}
		return obj.dataset.activeid;
	}
	return false;
};

const _getValFromList = (list, item, returnPos=false) => {
	let key, obj, prop, co = -1;
	for (key in list) {
		if (!list.hasOwnProperty(key)) continue;
		co++;
		obj = list[key];
		if (returnPos && obj.name == item) return co;
		for (prop in obj) {
			if(!obj.hasOwnProperty(prop)) continue;
			// Return item after removing any quotes.
			if (!returnPos && obj[prop] == item) {
				return obj.value.replace(/"/g, '');
			}
		}
	}
	return (returnPos) ? -1 : false;
};

const _getWindow = doc => {
	try {
		return doc.defaultView || doc.parentWindow;
	} catch(err) {
		return window;
	}
};

const _handleQuoAjax = (o, str) => {
	return str._ACSSRepQuo();
};

ActiveCSS._hasClassObj = (obj, str) => {	// Used by extensions.
	return obj.classList.contains(str) || false;
};

const _htmlToElement = html => {
	let template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
};

const _ifFocus = (o, first=true) => {
	let arr = _getFocusedOfNodes(o.actVal, o);
	if (first) {
		return (arr[1] === 0);
	} else {
		return (arr[1] == arr[0].length - 1);
	}
};

ActiveCSS._ifVisible = (o, tot) => {	// tot true is completely visible, false is partially visible. Used by extensions.
	let el, elContainer, aV;
	if (typeof aV === 'object') {	// Used by devtools highlighting.
		aV = o.actVal;
	} else {
		// The optional "scope" parameter determines which container holds the boundary information.
		// No "scope" parameter means that the document itself is the container.
		let aVRes = _extractActionPars(o.actVal, [ 'scope' ], o);
		if (aVRes.scope) {
			// Get scope element.
			elContainer = _getSel(o, aVRes.scope);
		}
		aV = aVRes.action;
	}

	el = (aV._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, aV);
	if (!el) return false;

	// Check in a container if one is found.
	if (elContainer) return _checkBoundaries(el, elContainer, tot);

	// Container not found. Use the document.
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (tot) ? (elTop >= 0) && (elBot <= window.innerHeight) : elTop < window.innerHeight && elBot >= 0;
};

const _isACSSStyleTag = (nod) => {
	return (nod && nod.tagName == 'STYLE' && nod.hasAttribute('type') && nod.getAttribute('type') == 'text/acss');
};

const _isCond = cond => typeof _c[cond] === 'function';

const _isConnected = obj => {
	return (obj.isConnected || obj === self || obj === document.body);
};

const _isInlineLoaded = nod => {
	let fullFile = '_inline_' + _getActiveID(nod);
	return configBox.find(item => item.file === fullFile);
};

const _isPositive = str => {
	return /^[\d]+$/.test(str);
};

const _isPositiveFloat = str => {
	return /^[\d\.]+$/.test(str);
};

const _isTextField = el => {
	let tagName = el.tagName;
	if (tagName == 'TEXTAREA') return true;
	if (tagName != 'INPUT') return false;
	if (!el.hasAttribute('type')) return true;
	return (['TEXT', 'PASSWORD', 'NUMBER', 'EMAIL', 'TEL', 'URL', 'SEARCH', 'DATE', 'DATETIME', 'DATETIME-LOCAL', 'TIME', 'MONTH', 'WEEK'].
		indexOf(el.getAttribute('type').toUpperCase()) !== -1);
};

const _mimicReset = e => {
	var key, obj, prop;
	for (key in e.target.cjsReset) {
		if (key == 'title') continue;
		obj = e.target.cjsReset[key];
		switch (obj.type) {
			case 'text':
				obj.el.innerText = obj.value;
				break;
			default:
				obj.el.value = obj.value;
				break;
		}
	}
	if (e.target.cjsReset.title) {
		_setDocTitle(e.target.cjsReset.title);
	}
};

const _optDef = (arr, srch, opt, def) => {
	// This is a case insensitive comparison.
	if (!_isArray(arr)) arr = arr.split(' ');	// For speed send in an array that is already split, but this also accepts a string for a one-off use.
	srch = srch.toLowerCase();
	let res = arr.findIndex(item => srch === item.toLowerCase());
	return (res !== -1) ? opt : def;	// return def if not present.
};

const _outDebug = (showErrs, errs) => {
	if (showErrs) {
		let err;
		for (err of errs) {
			console.log(err);
		}
	}
};

const _placeCaretAtEnd = el => {
	// Assumes el is already in focus. Only works with input fields for the moment.
	if (el.selectionStart || el.selectionStart === 0) {
		el.selectionStart = el.value.length;
		el.selectionEnd = el.value.length;
		el.blur();
	}
	el.focus();
};

const _prepareDetachedExpr = (str, varScope) => {
	// Evaluate as a detached expression - assuming there is no "o" object.
	let strObj = _handleVars([ 'rand', 'expr' ], { str, varScope });
	let valStr = _resolveVars(strObj.str, strObj.ref);
	valStr = _resolveInnerBracketVars(valStr, varScope);
	valStr = _prefixScopedVars(valStr, varScope);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed.
	return valStr;
};

const _random = (len, str=false, hex=false) => {
	let chars = (hex) ? RANDHEX + RANDNUMS : (str) ? RANDCHARS + RANDNUMS : RANDNUMS, rand = '', i = 0;
    for (i = 0; i < len; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
	return rand;
};

// Solution courtesy of https://github.com/cosmicanant/recursive-diff
// MIT license.
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.recursiveDiff=t():e.recursiveDiff=t()}("undefined"!=typeof self?self:this,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const{types:r,iterableTypes:o,errors:i}=n(1),l=n(2),f={[r.NUMBER]:l.isNumber,[r.BOOLEAN]:l.isBoolean,[r.STRING]:l.isString,[r.DATE]:l.isDate,[r.UNDEFINED]:l.isUndefined,[r.NULL]:l.isNull,[r.ARRAY]:l.isArray,[r.MAP]:l.isMap,[r.SET]:l.isSet,[r.ITERABLE_OBJECT]:l.isIterableObject},a={[r.DATE]:l.areDatesEqual};function u(e){const t=Object.keys(f);let n=r.DEFAULT;for(let r=0;r<t.length;r+=1)if(f[t[r]](e)){n=t[r];break}return n}function s(e,t,n,o){let i;return n===r.UNDEFINED&&o!==r.UNDEFINED?i="add":n!==r.UNDEFINED&&o===r.UNDEFINED?i="delete":!function(e,t,n,r){return n===r&&(a[n]?a[n](e,t):e===t)}(e,t,n,o)?i="update":l.noop(),i}function c(e,t,n,r,o){const i={op:n,path:r};return"add"!==n&&"update"!==n||(i.val=t),o&&"add"!==n&&(i.oldVal=e),i}function p(e,t,n,i,l){const f=u(e),a=u(t),d=i||[],E=l||[];if(function(e,t){return e===t&&o.indexOf(e)>=0}(f,a)){const o=function(e,t,n){if(n===r.ARRAY){const n=e.length>t.length?new Array(e.length):new Array(t.length);return n.fill(0),new Set(n.map((e,t)=>t))}return new Set(Object.keys(e).concat(Object.keys(t)))}(e,t,f).values();let{value:i,done:l}=o.next();for(;!l;){Object.prototype.hasOwnProperty.call(e,i)?Object.prototype.hasOwnProperty.call(t,i)?p(e[i],t[i],n,d.concat(i),E):E.push(c(e[i],t[i],"delete",d.concat(i),n)):E.push(c(e[i],t[i],"add",d.concat(i),n));const r=o.next();i=r.value,l=r.done}}else{const r=s(e,t,f,a);null!=r&&E.push(c(e,t,r,i,n))}return E}const d={add:l.setValueByPath,update:l.setValueByPath,delete:l.deleteValueByPath};e.exports={getDiff:(e,t,n=!1)=>p(e,t,n),applyDiff:(e,t,n)=>function(e,t,n){if(!(t instanceof Array))throw new Error(i.INVALID_DIFF_FORMAT);let r=e;return t.forEach(e=>{const{op:t,val:o,path:l}=e;if(!d[t])throw new Error(i.INVALID_DIFF_OP);r=d[t](r,l,o,n)}),r}(e,t,n)}},function(e,t){const n={NUMBER:"NUMBER",BOOLEAN:"BOOLEAN",STRING:"STRING",NULL:"NULL",UNDEFINED:"UNDEFINED",DATE:"DATE",ARRAY:"ARRAY",MAP:"MAP",SET:"SET",ITERABLE_OBJECT:"ITERABLE_OBJECT",DEFAULT:"OBJECT"};e.exports={types:n,iterableTypes:[n.ITERABLE_OBJECT,n.MAP,n.ARRAY,n.SET],errors:{EMPTY_DIFF:"No diff object is provided, Nothing to apply",INVALID_DIFF_FORMAT:"Invalid diff format",INVALID_DIFF_OP:"Unsupported operation provided into diff object"}}},function(e,t){const n=e=>t=>t instanceof e,r=n(Date),o=n(Array),i=n(Map),l=n(Set),f=e=>"[object Object]"===Object.prototype.toString.call(e);e.exports={isNumber:e=>"number"==typeof e,isBoolean:e=>"boolean"==typeof e,isString:e=>"string"==typeof e,isDate:r,isUndefined:e=>void 0===e,isNull:e=>null===e,isArray:o,isMap:i,isSet:l,isIterableObject:f,noop:()=>{},areDatesEqual:(e,t)=>e.getTime()===t.getTime(),setValueByPath:function(e,t=[],n,r){if(!o(t))throw new Error(`Diff path: "${t}" is not valid`);const{length:i}=t;if(0===i)return n;let l=e;for(let o=0;o<i;o+=1){const f=t[o];if(!l)throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);if(null==f)throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);o!==i-1?(l=l[f],r&&r(l)):l[f]=n}return e},deleteValueByPath:function(e,t){const n=t||[];if(0===n.length)return;let r=e;const{length:o}=n;for(let i=0;i<o;i+=1)if(i!==o-1){if(!r[n[i]])throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);r=r[n[i]]}else if(f(r))delete r[n[i]];else{const e=parseInt(n[i],10);for(;r.length>e;)r.pop()}return e}}}])}));	// jshint ignore:line
ActiveCSS._removeClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	let arr = str.replace('.', '').split(' ');
	obj.classList.remove(...arr);
};

ActiveCSS._removeObj = obj => {
	if (!obj) return; // element is no longer there.
	obj.remove();
};

const _replaceTempActiveID = obj => {
	if (obj && obj.dataset && obj.dataset.activeid) {
		obj._acssActiveID = obj.dataset.activeid;
		obj.removeAttribute('data-activeid');
		idMap[obj._acssActiveID] = obj;
	}
};

const _resolveURL = url => {
	if (inIframe) return url;	// Won't allow changing the URL from an iframe.
	let orig = window.location.href, st = history.state, t = document.title;
	history.replaceState(st, t, url);
	let resUrl = window.location.href;
	history.replaceState(st, t, orig);
	return resUrl;
};

const _safeTags = str => {
	// Note the backslashes are for ensuring proper escaping happens when used in the regex.
	let mapObj = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'/': '&sol;',
		'{': '&#123;',
		'}': '&#125;',
		'"': '&quot;',
		'\'': '&#39;',
		'\\\\': '&#92;',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};

const _selCompare = (o, opt) => {
	// Takes two parameters. First a selector, and secondly something else to compare.
	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl, compareVal;
	if (opt == 'eM' || opt == 'eMT') {
		// There can be only one (parameter).
		if (!actVal) return true;	// No point going further - this could be a variable substitution that equates to empty.
		if (actVal && actVal == '__object') return false;	// No point going further - this is not empty - it is an array or a variable object.
		spl = actVal._ACSSSpaceQuoOut()._ACSSRepQuo();
	} else {
		// There are two parameters with this conditional.
		spl = actVal.split(' ');
		// If there isn't two parameters and it's allowed for the built-in conditional, add a "self" as the default.
		if (spl.length == 1 && _condDefSelf(o.actName)) spl.unshift('self');
		compareVal = spl.pop()._ACSSSpaceQuoOut()._ACSSRepQuo();
		spl = spl.join(' ');
	} 
	let el;
	el = _getSel(o, spl);

	let widthHeightEl = false;
	if (['maW', 'miW', 'maH', 'miH'].indexOf(opt) !== -1) {
		widthHeightEl = true;
	}
	if (!el) {
		if (widthHeightEl) {
			// When referencing height or width we need an element. If it isn't there then return false.
			return false;
		}
		el = spl;
	}
	if (widthHeightEl) {
		compareVal = compareVal.replace('px', '');
		let styleVal, prop;
		switch (opt) {	// optimized for dynamic speed more than maintainability.
			case 'maW':
			case 'miW':
				prop = 'width';
				break;
			case 'maH':
			case 'miH':
				prop = 'height';
		}
		if (prop) {
			let s = el.style[prop];
			if (!s) {
				let rect = el.getBoundingClientRect();
				styleVal = (rect && rect[prop]) ? rect[prop] : 0;
			} else {
				styleVal = s.replace('px', '');
			}
		}
		switch (opt) {
			case 'maW':
			case 'maH':
				return (styleVal <= compareVal);
			case 'miW':
			case 'miH':
				return (styleVal >= compareVal);
		}
	}
	switch (opt) {
		case 'eM':
		case 'eMT':
		case 'maL':
		case 'miL':
			// _c.IfEmpty, _c.IfMaxLength, _c.IfMinLength
			let firstVal;
			if (el && !widthHeightEl && el.nodeType && el.nodeType == Node.ELEMENT_NODE) {
				let valWot = _getFieldValType(el);
				firstVal = el[valWot];
			} else {
				firstVal = el;
			}
			switch (opt) {
				case 'eM':
				case 'eMT':
					return (!firstVal || (opt == 'eMT') ? firstVal.trim() === '' : firstVal === '');
				case 'maL':
					return (firstVal.length <= compareVal);
				case 'miL':
					return (firstVal.length >= compareVal);
			}
			break;
		case 'iT':
			// _c.IfInnerText
			return (el && compareVal == el.innerText);
		case 'iH':
			// _cIfInnerHTML
			return (el && compareVal == el.innerHTML);
		case 'iV':
			// _cIfValue
			return (el && compareVal == el.value);
		case 'iC':
			// _cIfChecked
			return (el && el.checked);
	}
};

const _setClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.className = str;
};

const _setDocTitle = titl => {
	currDocTitle = ActiveCSS._decodeHTML(titl);
	document.title = currDocTitle;
};

const _setsrcObj = (obj, inSrc) => {
	if (!obj) return; // element is no longer there.
	obj.src = inSrc;
};

const _setUnderPage = () => {
	currUnderPage = window.location.pathname + window.location.search;
};

const _toggleClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.classList.toggle(str);
};

const _unEscNoVars = str => {
	return str.replace(/__ACSSnoVarsOpCurly/gim, '{').replace(/__ACSSnoVarsClCurly/gim, '}');
};

const _unHtmlEntities = str => {
	let txt = document.createElement("textarea");
	txt.innerHTML = str;
	return txt.value;
};

const _unSafeTags = str => {
	// _safeTags is the opposite function. Backslashes are further escaped from here to remain intact for use.
	let mapObj = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&sol;': '/',
		'&#123;': '{',
		'&#125;': '}',
		'&quot;': '"',
		'&#39;': '\'',
		'&#92;': '\\\\',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};

const _urlTitle = (url, titl, o, alsoRemove='') => {
	if (inIframe) return;
	url = url.replace(/"/g, '');
	titl = titl._ACSSRepQuo();

	let emptyPageClick = false;

	if (o._addHash || o._removeHash) {
		let tmpHash = window.location.hash;
		if (tmpHash !== '') {
			tmpHash = tmpHash.substr(1).trim();
		}

		let hashSplit = tmpHash.split('#');
		url = url.substr(1);	// Won't work if adding or removing "#house#corridor", items must be singular.
		let hashSplitLen = hashSplit.length;
		let n, hashIsThere = false, otherHashToRemove = 0, lastHash;

		if (o._removeLastHash && (window.location.protocol != 'file:' || hashSplitLen > 1)) {
			// Remove the last hash in the string. This is all that the remove option supports at the moment.
			// If this is an offline site, don't remove the first hash as it's going to be an underlying page. That's the rule for this option.
			hashSplit.pop();
		}

		for (n = 0; n < hashSplitLen; n++) {
			if (url == hashSplit[n]) {
				hashIsThere = n;
				break;
			}
		}

		if (hashIsThere === false && o._addHash) {
			// Add the hash.
			hashSplit.push(url);
		} else if (hashIsThere !== false && o._removeHash) {
			// Remove the hash.
			hashSplit.splice(hashIsThere, 1);
		}

		url = window.location.pathname + window.location.search + (hashSplit.length > 0 ? '#' + hashSplit.join('#') : '');
		emptyPageClick = true;

	} else if (url == '') {
		// This should only get called from an in-page event, with the url-change/url-replace command url set to "".
		// This should remove the hash from the URL if it is there, otherwise it will do nothing and assume it's the same page.
		let currHash = window.location.hash;
		let lastHash = currHash.lastIndexOf('#');
		if (lastHash !== -1 && lastHash != currHash.indexOf('#')) {
			// If it's an offline SPA with a double-hash, set the URL to the part after the first hash as this will be the SPA root page.
			url = window.location.pathname + window.location.search + currHash.substr(0, lastHash);
		} else {
			url = window.location.pathname + window.location.search;
		}
		emptyPageClick = true;
	}

	url = _resolveURL(url);

	// Detect if this is a popstate event and skip the next bit if it is. If it is, we don't need to update the URL as it has already changed.
	// Add/change history object if applicable.
	if (window.location.href != url && (!o.e || o.e.type != 'popstate')) {	// needs the popstate check, otherwise we add a new history object.
		let attrs = '';

		// If this is a new hash url, get the original page that called this rather than the hash link object so we get the correct underlying page change attributes.
		if (typeof o.secSelObj == 'object') {
			if (emptyPageClick || url.indexOf('#') !== -1) {
				// This has been triggered from this page, so we can simply get the current state attrs value which contains all we need.
				attrs = window.history.state.attrs || '';
			} else {
				[...o.secSelObj.attributes].forEach(attr => {
					if (attr.name == 'id') return;	// mustn't set these, otherwise the url could change again in the SPA trigger event.
					attrs += attr.name + '="' + attr.value + '" ';
				});
			}
		}

		let doWhat = (o._urlReplace) ? 'replaceState' : 'pushState';

		window.history[doWhat]({ url, attrs: attrs.trimEnd() }, titl, url);
		_setUnderPage();
	}
	_setDocTitle(titl);
};

const _warn = (str, o, ...args) => {
	if (DEVCORE) {
		_errDisplayLine('Active CSS error warning', str, [ 'color: green' ], o, args);	// jshint ignore:line
	}
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
*/
const _arrayMap = (array, iteratee) => {
	var index = -1,
	length = array == null ? 0 : array.length,
	result = Array(length);

	while (++index < length) {
		result[index] = iteratee(array[index], index, array);
	}
	return result;
};

/**
* Assigns `value` to `key` of `object` if the existing value is not equivalent
* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
* for equality comparisons.
*
* @private
* @param {Object} object The object to modify.
* @param {string} key The key of the property to assign.
* @param {*} value The value to assign.
*/
const _assignValue = (object, key, value) => {
	var objValue = object[key];
	if (!(hasOwnProperty.call(object, key) && _eq(objValue, value)) || (value === undefined && !(key in object))) {
		_baseAssignValue(object, key, value);
	}
};

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
*/
const _baseAssignValue = (object, key, value) => {
	if (key == '__proto__' && defineProperty) {
		defineProperty(object, key, {
			'configurable': true,
			'enumerable': true,
			'value': value,
			'writable': true
		});
	} else {
		object[key] = value;
	}
};

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
*/
const _baseGet = (object, path) => {
	path = _castPath(path, object);
	var index = 0, length = path.length;
	while (object != null && index < length) {
		object = object[_toKey(path[index++])];
	}
	return (index && index == length) ? object : undefined;
};

/**
* The base implementation of `_.set`.
*
* @private
* @param {Object} object The object to modify.
* @param {Array|string} path The path of the property to set.
* @param {*} value The value to set.
* @param {Function} [customizer] The function to customize path creation.
* @returns {Object} Returns `object`.
*/
const _baseSet = (object, path, value, customizer) => {
	if (!_isObject(object)) return object;
	path = _castPath(path, object);

	var index = -1, length = path.length, lastIndex = length - 1, nested = object;

	while (nested != null && ++index < length) {
		var key = _toKey(path[index]),
		newValue = value;

		if (index != lastIndex) {
			var objValue = nested[key];
			newValue = customizer ? customizer(objValue, key, nested) : undefined;
			if (newValue === undefined) {
				newValue = _isObject(objValue) ? objValue : (_isIndex(path[index + 1]) ? [] : {});
			}
		}
		_assignValue(nested, key, newValue);
		nested = nested[key];
	}
	return object;
};

/**
* The base implementation of `_.toString` which doesn't convert nullish
* values to empty strings.
*
* @private
* @param {*} value The value to process.
* @returns {string} Returns the string.
*/
const _baseToString = value => {
	// Exit early for strings to avoid a performance hit in some environments.
	if (typeof value == 'string') return value;
	if (_isArray(value)) return _arrayMap(value, _baseToString) + '';	// Recursively convert values (susceptible to call stack limits).
//	if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : '';	// don't need symbol support in acss.
	var result = (value + '');
	return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
};

/**
 * The base implementation of `unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
const _baseUnset = (object, path) => {
	path = _castPath(path, object);
	object = _parent(object, path);
	return object == null || delete object[_toKey(_last(path))];
};

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
*/
const _castPath = (value, object) => {
	if (_isArray(value)) return value;
	return _isKey(value, object) ? [value] : _stringToPath(_toString(value));
};

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
*/
const _eq = (value, other) => {
	return value === other || (value !== value && other !== other);
};

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
*/


const _get = (object, path, defaultValue) => {
	var result = object == null ? undefined : _baseGet(object, path);
	return result === undefined ? defaultValue : result;
};

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
*/
const _getNative = (object, key) => {
	var value = _getValue(object, key);
//	return _baseIsNative(value) ? value : undefined;	// more than we need in acss.
	return value;
};

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
*/
const _getValue = (object, key) => {
	return object == null ? undefined : object[key];
};

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
*/
const _isIndex = (value, length) => {
	var type = typeof value;
	length = length == null ? MAX_SAFE_INTEGER : length;
	return !!length && (type == 'number' || (type != 'symbol' && reIsUint.test(value))) && (value > -1 && value % 1 == 0 && value < length);
};

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
*/

const _isKey = (value, object) => {
	if (_isArray(value)) return false;
	var type = typeof value;
//	if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) return true;	// don't need symbol support in acss.
	if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null) return true;
	return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (object != null && value in Object(object));
};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
*/
const _isObject = value => {
	var type = typeof value;
	return value != null && (type == 'object' || type == 'function');
};

/**
 * Gets the last element of `array`.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * last([1, 2, 3])
 * // => 3
 */
const _last = array => {
	const length = array == null ? 0 : array.length;
	return length ? array[length - 1] : undefined;
};

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
const _parent = (object, path) => {
	return path.length < 2 ? object : _baseGet(object, _slice(path, 0, -1));
};

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `_.setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, ['x', '0', 'y', 'z'], 5);
 * console.log(object.x[0].y.z);
 * // => 5
*/
const _set = (object, path, value) => {
	return object == null ? object : _baseSet(object, path, value);
};


/**
 * Creates a slice of `array` from `start` up to, but not including, `end`.
 *
 * **Note:** This method is used instead of
 * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
 * returned.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position. A negative index will be treated as an offset from the end.
 * @param {number} [end=array.length] The end position. A negative index will be treated as an offset from the end.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * var array = [1, 2, 3, 4]
 *
 * _.slice(array, 2)
 * // => [3, 4]
 */
const _slice = (array, start, end) => {
	let length = array == null ? 0 : array.length;
	if (!length) {
		return [];
	}
	start = start == null ? 0 : start;
	end = end === undefined ? length : end;

	if (start < 0) {
		start = -start > length ? 0 : (length + start);
	}
	end = end > length ? length : end;
	if (end < 0) {
		end += length;
	}
	length = start > end ? 0 : ((end - start) >>> 0);
	start >>>= 0;

	let index = -1;
	const result = new Array(length);
	while (++index < length) {
		result[index] = array[index + start];
	}
	return result;
};

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
*/
//const _stringToPath = _memoizeCapped(function(string) {
const _stringToPath = string => {
	var result = [];
	if (string.charCodeAt(0) === 46 /* . */) result.push('');
	string.replace(rePropName, function(match, number, quote, subString) {
		result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	});
	return result;
};

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
	ACSS = modded to remove symbol references as it isn't needed.
*/
const _toKey = (value) => {
//	if (typeof value == 'string' || isSymbol(value)) return value;	// don't need symbol support in acss.
	if (typeof value == 'string') return value;
	var result = (value + '');
	return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
};

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
*/
const _toString = value => {
	return value == null ? '' : _baseToString(value);
};

/**
 * Removes the property at `path` of `object`.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 * @see get, has, set
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 7 } }] }
 * unset(object, 'a[0].b.c')
 * // => true
 *
 * console.log(object)
 * // => { 'a': [{ 'b': {} }] }
 *
 * unset(object, ['a', '0', 'b', 'c'])
 * // => true
 *
 * console.log(object)
 * // => { 'a': [{ 'b': {} }] }
 */
const _unset = (object, path) => {
	return object == null ? true : _baseUnset(object, path);
};

String.prototype._ACSSCapitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype._ACSSCapitalizeAttr = function() {
	return this.replace(/(^|[\s-])\S/g, function (match) {
		return match.toUpperCase();
	});
};

String.prototype._ACSSConvFunc = function() {
	// Note - this is used for both conditionals and commands, so we don't add the "_a" or "_c" at the beginning.
	// Mustn't convert starting with "--".
	return (this.startsWith('--')) ? this : this._ACSSCapitalizeAttr().replace(/\-/g, '');
};

String.prototype._ACSSRepAllQuo = function() {
	return this.replace(/"/g, '');
};

String.prototype._ACSSRepQuo = function() {
	var html = this.replace(/\\"/g, '_ACSS*%%_');
	html = html.replace(/(^")|("$)/g, '');
	html = html.replace(/_ACSS\*%%_/g, '"');
	return html;
};

String.prototype._ACSSSpaceQuoIn = function() {
	return _escInQuo(this, ' ', '_ACSS_space');
};

String.prototype._ACSSSpaceQuoOut = function() {
	return this.replace(/_ACSS_space/g, ' ');
};

// Edge hack - just get it vaguely working on old Edge. Shadow DOM components are not supported in Edge, so they won't work in Active CSS either.
if (!document.head.attachShadow) {
	supportsShadow = false;
	if (!('isConnected' in Node.prototype)) {
		Object.defineProperty(Node.prototype, 'isConnected', {
			get() {
				return (!this.ownerDocument || !(this.ownerDocument.compareDocumentPosition(this) & this.DOCUMENT_POSITION_DISCONNECTED));
			},
		});
	}
}

// For Firefox 48.
if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (callback, thisArg) {
		thisArg = thisArg || window;
		let i = 0;
		for (i; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	};
}


	const DEVCORE = (typeof _drawHighlight !== 'undefined') ? true : false;
	if (DEVCORE) {
		console.log('Running Active CSS development edition' + (inIframe ? ' in iframe' : ''));
	}

	// Is there embedded Active CSS? If so, initiate the core.
	document.addEventListener('DOMContentLoaded', function(e) {
		setTimeout(function() {
			// User setup should have started by this point. If not, initialise Active CSS anyway.
			// If there is a user setup initialized, then embedded acss is handled there and not here.
			// This is so that _readSiteMap happens at the end of config accumulation and we can fire all the initalization events at once.
			if (!userSetupStarted) {
				autoStartInit = true;
				ActiveCSS.init();
			}
		}, 0);
	});
}(window, document));