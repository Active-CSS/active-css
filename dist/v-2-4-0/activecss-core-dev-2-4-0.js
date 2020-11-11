/*jslint browser: true */
/*global alert, console, getSelection, inspect, self, window  */

(function (global, document) {
	'use strict';
	const PARSELINEX = /([^\:]+):([^\;]*)(;)?/;
	const PARSEREGEX = /((?!\*debugfile)[^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|((?!\*debugfile)[^\;\{\}]+\;(?!\s*\*\/))|(\*debugfile[\s\S]*?\*)/gmi;
	const PARSESEL = 1;
	const PARSEEND = 2;
	const PARSEATTR = 3;
	const PARSEDEBUG = 4;

	// Note: COLONSELS should be kept up-to-date with any new selector conditions/functions.
	// Don't forget that double backslashes are needed with quoted regexes.
	const COLONSELS = '^(' +
		// Word not followed by another name type character.
		'(active|any\\-link|blank|checked|current|default|disabled|drop|empty|enabled|first\\-child|first\\-of\\-type|focus|focus\\-visible|focus\\-within|future|hover|indeterminate|in\\-range|invalid|last\\-child|last\\-of\\-type|link|local\\-link|only\\-child|only\\-of\\-type|optional|out\\-of\\-range|past|paused|placeholder\\-shown|playing|read\\-only|read\\-write|required|root|scope|target|target\\-within|user\\-error|user\\-invalid|valid|visited)(?![\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w_\\-])|' +
		// Word and opening parenthesis.
		'(current|dir|drop|has|is|lang|not|nth\\-column|nth\\-child|nth\\-last\\-child|nth\\-last\\-column|nth\\-last\\-of\\-type|nth\\-of\\-type|where)\\(' +
		')';

	const DYNAMICCHARS = {
		',': '_ACSS_later_comma',
		'{': '_ACSS_later_brace_start',
		'}': '_ACSS_later_brace_end',
		';': '_ACSS_later_semi_colon',
		':': '_ACSS_later_colon',
		'"': '_ACSS_later_double_quote'
	};

	const STYLEREGEX = /\/\*active\-var\-([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\:\[\]]+)\*\/(((?!\/\*).)*)\/\*\/active\-var\*\//g;

	window.ActiveCSS = {};

	if (typeof module !== 'undefined') module.exports = ActiveCSS;	// This is for NPM.

	var coreVersionExtension = '2-0-0',		// Used by the extensions to maintain backward-compatibility - this doesn't reflect minor core version changes.
		_a = {},							// Active CSS action commands.
		_c = {},							// Active CSS conditionals.
		parsedConfig = {},
		config = [],
		configArr = [],
		configLine = '',
		configFile = '',
		lazyConfig = [],
		concatConfig = '',
		concatConfigCo = 0,
		concatConfigLen = 0,
		currentPage = '',
		ajaxResLocations = {},
		pageList = [],
		eventState = {},
		delayArr = [],
		cancelIDArr = [],				//	[data-activeid][func];		// for cancel-delay
		cancelCustomArr = [],			//	[~(custom event)][func];	// for cancel-delay
		intIDCounter = 0,
		selectors = [],
		userSetupStarted = false,
		autoStartInit = false,
		setupEnded = false,
		clickOutsideSet = false,
		clickOutsideSels = [],
		mimicClones = [],				// Used by the clone and restore-clones commands.
		currDocTitle = document.title,
		debugMode = '',
		conditionals = [],
		components = [],
		mediaQueries = [],
		mediaQueriesOrig = [],
		activeIDTrack = 0,
		scriptTrack = [],
		debuggerActive = false,
		debuggerness = false,
		debuggerExtID = null,
		debuggerEvs = [ 'afterLoadConfig' ],
		debuggerCo = 0,
		evEditorExtID = null,
		evEditorActive = false,
		devtoolsInit = [],
		// The variable containing the scoped variables that is proxied (using _observable-Slim) for detecting changes.
		scoped = {},
		// This is actually a proxy, but used as the variable manipulator in the core. It is simpler just to call it the main variable as we never reference
		// the vars direct.
		scopedVars = null,
		// This is a map to information about the proxy variable. This is updated when variables are rendered, and stores location data to be updated
		// when the proxy target is modified.
		scopedData = {},
		labelData = [],
		labelByIDs = [],
		customTags = [],
		// The next two keep track of pending shadow DOM and scoped components to render.
		compCount = 0,
		compPending = {},
		compParents = [],
		compPrivEvs = [],
		privVarScopes = [],
		shadowSels = [],
		shadowDoms = {},
		actualDoms = {},
		preGetMax = 6,
		preGetMid = 0,
		reverseShadowEvs = {},
		allEvents = [],
		doesPassive = false,
		preSetupEvents = [],
		nonPassiveEvents = [],
		passiveEvents = true,
		inlineConfigTags = null,
		supportsShadow = true,
		idMap = [],
		varMap = [],
		varStyleMap = [],
		varInStyleMap = [],
		elementObserver;

	ActiveCSS.customHTMLElements = {};

/* Closure in _core-end.js */
_a.AddClass = o => {	// Note thisID is needed in case the "parent" selector is used.
	ActiveCSS._addClassObj(o.secSelObj, o.actVal);
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
		console.log('Active CSS error: Form not found.', o.secSelObj);
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
	document.activeElement.blur();
};

_a.CancelTimer = o => {
	// Delay action on a secSel by action or label.
	// This is scoped by document or specific shadow DOM or component.
	let val = o.actVal.trim();
	let func = val._ACSSConvFunc();
	let found = true;
	let i, pos, intID, delayRef, loopref;
	let scope = (o.compRef) ? o.compRef : 'main';
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
		delayRef = (!(typeof o.secSel == 'string' && ['~', '|'].includes(o.secSel.substr(0, 1)))) ? _getActiveID(o.secSelObj) : o.secSel;
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
	console.log(o.actVal._ACSSRepQuo());
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
	let funcName = o.actVal.trim().split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.

	if (_a[funcName]) return;	// If this command already exists, do nothing more.
	funcContent = ActiveCSS._sortOutFlowEscapeChars(funcContent).slice(2, -2);
	funcContent = _handleVarsInJS(funcContent);

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	funcContent = 'let actionName = o.actName,' +	// The name of the action command that called this function.
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
		'_loopVars = o.loopVars,' +					// Internal reference for looping variables.
		'_loopRef = o.loopRef,' +					// Internal reference for looping variable reference.
		'_activeVarScope = (o.compRef && privVarScopes[o.compRef]) ? o.compRef : "main";' +
		'scopedVars[_activeVarScope] = (scopedVars[_activeVarScope] === undefined) ? {} : scopedVars[_activeVarScope];' +
		funcContent;
	// Its primary purpose is to create a command, which is a low-level activity.
	// There is little benefit to having it run more than once, as no variable substitution is allowed in here, and would only lead to inevitable pointless recreates.
	// It would be nice to have it recreated on a realtime edit in the extension. This would need to be set up in the extension area to detect and remove
	// the function if it is edited, but that code has no place in here.
	_a[funcName] = new Function('o', 'scopedVars', 'privVarScopes', funcContent);		// jshint ignore:line
};

_a.CreateConditional = o => {
	// Create an Active CSS conditional dynamically.
	let funcName = o.actVal.trim().split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.
	if (_c[funcName]) return;	// If this command already exists, do nothing more.
	funcContent = ActiveCSS._sortOutFlowEscapeChars(funcContent).slice(2, -2);
	funcContent = _handleVarsInJS(funcContent);

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	funcContent = 'let conditionalName = o.actName,' +	// The name of the action command that called this function.
		'conditionalFunc = o.func,' +
		'conditionalValue = o.actVal,' +
		'eventSelectorName = o.primSel,' +
		'eventSelector = o.obj,' +
		'e = o.e,' +
		'doc = o.doc,' +
		'component = o.component,' + 
		'compDoc = o.compDoc,' + 
		'carriedEventObject = o.ajaxObj,' +
		'_activeVarScope = (o.compRef && privVarScopes[o.compRef]) ? o.compRef : "main";' +
		'scopedVars[_activeVarScope] = (scopedVars[_activeVarScope] === undefined) ? {} : scopedVars[_activeVarScope];' +
		funcContent;
	// Its primary purpose is to create a command, which is a low-level activity.
	// There is little benefit to having it run more than once, as no variable substitution is allowed in here, and would only lead to inevitable pointless recreates.
	// It would be nice to have it recreated on a realtime edit in the Elements extension. This would need to be set up in the extension area to detect and remove
	// the function if it is edited, but that code has no place in here.
	_c[funcName] = new Function('o', 'scopedVars', 'privVarScopes', funcContent);		// jshint ignore:line
};

_a.CreateElement = o => {
	let aV = o.actVal, tag, upperTag, attrArr, attr, attrs = '', customTagClass, createTagJS, component, splitAV;
	splitAV = aV.split(' ');
	tag = splitAV[0];
	upperTag = tag.toUpperCase();
	if (customTags.includes(upperTag)) return;	// The custom tag is already declared - skip it.

	// Get attributes. Cater for the possibility of multiple spaces in attr() list in actVal.
	attrArr = _getParVal(aV, 'observe').split(' ');
	for (attr of attrArr) {
		if (!attr) continue;
		attrs += "'" + attr.trim() + "',";
	}
	customTags.push(upperTag);

	// This is always need here. This should work on pre-rendered elements as long as the create-element is in preInit.
	// We need to remember this, and use it in _handleevents, as we won't run a component delineated event, we will run this main event draw event. Still without
	// leaving the component scope though. We just want this check in one little place in handleEvents and it should all work.
	// We have the customTags already in an array. If the event is a draw event and the element tag is in the array, we run the main draw event.

	if (splitAV[1].indexOf('observe(') === -1) {
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
		secSel['&'][0] = { file: '', line: '', intID: intIDCounter++, name: 'render', value: '"{|_acss-host_' + component + '}"' };
		// Put the draw event render command at the beginning of any draw event that might already be there for this element.
		config[tag].draw[0][0].unshift(secSel);
		_setupEvent('draw', tag);
	}

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
				'_handleEvents({ obj: this, evType: \'connectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, compRef: compDetails.compRef });' +
			'}' +
			'disconnectedCallback() {' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'disconnectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, compRef: compDetails.compRef, runButElNotThere: true });' +	// true = run when not there.
			'}';
	if (attrs) {
		createTagJS +=
			'attributeChangedCallback(name, oldVal, newVal) {' +
				'if (!oldVal && oldVal !== \'\' || oldVal === newVal) return;' +	// skip if this is the first time in or there's an unchanging update.
				'this.setAttribute(name + \'-old\', oldVal); ' +
				'let ref = this._acssActiveID.replace(\'d-\', \'\') + \'HOST\' + name;' +
				'ActiveCSS._varUpdateDom([{currentPath: ref, previousValue: oldVal, newValue: newVal, type: \'update\'}]);' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'attrChange\' + name._ACSSConvFunc(), component: compDetails.component, compDoc: compDetails.compDoc, compRef: compDetails.compRef });' +
			'}';
	}
	createTagJS +=
		'};' +
		'customElements.define(\'' + tag + '\', ActiveCSS.customHTMLElements.' + customTagClass + ');';
	Function('_handleEvents, _componentDetails', '"use strict";' + createTagJS)(_handleEvents, _componentDetails);	// jshint ignore:line
};

_a.DocumentTitle = o => {
	document.title = o.actVal._ACSSRepQuo();
};

_a.Eval = o => {
	// Run JavaScript dynamically in the global window scope. This is straight-up JavaScript that runs globally.
	let evalContent = ActiveCSS._sortOutFlowEscapeChars(o.actVal.trim().slice(2, -2));
	eval(evalContent);		// jshint ignore:line
};

_a.FocusOff = o => { _a.Blur(o); };

_a.FocusOn = o => { _focusOn(o); };

const _focusOn = (o, wot, justObj=false) => {
	let el, nodes, arr, useI, doClick = false, moveNum = 1, n, targEl;
	// For previousCycle and nextCycle, as well as a selector, it also takes in the following parameters:
	// 2, 3 - this says how far to go forward or back.
	// click - clicks on the item
	let val = o.actVal;
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
			arr = _getFocusedOfNodes(val, o);	// compares the focused element to the list and gives the position and returns the nodes. Could optimize this for when moveNum > 0.
			nodes = arr[0];
			useI = arr[1];
			if (wot == 'pcc' || wot == 'ncc') {
				if (moveNum > nodes.length) {
					moveNum = moveNum % nodes.length;	// Correct moveNum to be less than the actual length of the node list (it gets the remainder).
				}
			}
		} else {
			// This will only ever run once, as moveNum will always be one.
			let targArr = _splitIframeEls(val);
			if (!targArr) return false;	// invalid target.
			nodes = targArr[0].querySelectorAll(targArr[1]) || null;
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
			targEl.focus();
		}, 0);
	} else if (!justObj) {
		if (o.func.substr(0, 5) == 'Click') {
			ActiveCSS.trigger(targEl, 'click');
		} else {
			el.focus();
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
	let spl = o.actVal.trim().split(' ');
	let func = spl.splice(0, 1);
	if (typeof window[func] !== 'function') {
		console.log(func + ' is not a function.');
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

_a.LoadConfig = o => {
	// Dynamically load additional config if it has not already been loaded and append to existing unprocessed concatenated config.
	o.actVal = o.actVal._ACSSRepQuo().trim();
	_addActValRaw(o);
	if (!configArr.includes(o.avRaw)) {
		o.file = o.actVal;	// We want the original to show in the extensions.
		_getFile(o.actVal, 'txt', o);
	} else {
		// Run the success script - we should still do this, we just didn't need to load the config.
		_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', compRef: o.compRef, compDoc: o.compDoc, component: o.component });
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
	let storeRef = (opt == 'style' && forShadow) ? o.compRef + '|' : '';
	let trimmedURL = storeRef + _getBaseURL(scr);
	if (!scriptTrack.includes(trimmedURL)) {
		let typ = (opt == 'style') ? 'link' : 'script';
		let srcTag = (opt == 'style') ? 'href' : 'src';
		let scrip = document.createElement(typ);
		if (opt == 'style') {
			scrip.rel = 'stylesheet';
		}
		scrip[srcTag] = scr;
		scrip.onload = function() {
			_handleEvents({ obj: o.obj, evType: 'afterLoad' + ((opt == 'style') ? 'Style' : 'Script'), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
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
			document.title = ActiveCSS._decodeHTML(insVal);
			currDocTitle = ActiveCSS._decodeHTML(insVal);
	}
};

_a.PreventDefault = o => {
	if (o.e) o.e.preventDefault();	// Sometimes will get activated on a browser back-arrow, etc., so check first.
};

_a.PreventEventDefault = o => {
	// This breaks out of the component event hierarchy once all the actions for that component have taken place.
	if (typeof o.obj == 'object') o.obj.activePrevEvDef = true;
};

_a.Remove = o => {
	let thisObj = _getSel(o, o.actVal.trim(), true);
	if (thisObj !== false) {
		// This is self or a host element.
		ActiveCSS._removeObj(thisObj);
	} else {
		let targArr = _splitIframeEls(o.actVal, o.obj, o.compDoc);
		if (!targArr) return false;	// invalid target.
		targArr[0].querySelectorAll(targArr[1]).forEach(function (obj) {
			ActiveCSS._removeObj(obj);
		});
	}
};

_a.RemoveAttribute = o => {
	o.secSelObj.removeAttribute(o.actVal);
};

_a.RemoveClass = o => {
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
	let aV = o.actVal._ACSSRepQuo(), cookieName, cookieDomain, cookiePath, str;

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

_a.RemoveProperty = o => {
	o.secSelObj.style.removeProperty(o.actVal);
};

// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	// Handle quotes.
	let content = _handleQuoAjax(o, o.actVal);	// Rejoin the string.

	// Make a copy of the target selector.
	// The child nodes of the target element can be referenced and output in inner components by referencing {$CHILDREN}.
	// The actual node itself can be referenced and output in inner components by referencing {$SELF}.
	let copyOfSecSelObj = o.secSelObj.cloneNode(true);
	let selfTree;
	if (content.indexOf('{$SELF}') !== -1) {
		selfTree = copyOfSecSelObj.outerHTML;
		o.renderPos = 'replace';
	}
	let childTree = copyOfSecSelObj.innerHTML;

	// Handle any components. This is only in string form at the moment and replaces the component with a placeholder - not the full html.
	content = _replaceComponents(o, content);

	// Handle any ajax strings.
	content = _replaceStringVars(o.ajaxObj, content);

	// Handle any reference to {$CHILDREN} that need to be dealt with with these child elements before any components get rendered.
	content = _renderRefElements(content, childTree, 'CHILDREN');

	// Handle any reference to {$SELF} that needs to be dealt with before any components get rendered.
	content = _renderRefElements(content, selfTree, 'SELF');

	content = _replaceScopedVars(content, o.secSelObj, 'Render', null, false);

	_renderIt(o, content, childTree, selfTree);
};

_a.RenderAfterBegin = o => { o.renderPos = 'afterbegin'; _a.Render(o); };

_a.RenderAfterEnd = o => { o.renderPos = 'afterend'; _a.Render(o); };
_a.RenderBeforeBegin = o => { o.renderPos = 'beforebegin'; _a.Render(o); };

_a.RenderBeforeEnd = o => { o.renderPos = 'beforeend'; _a.Render(o); };

_a.RenderReplace = o => { o.renderPos = 'replace'; _a.Render(o); };

_a.RestoreClone = o => {
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
	let inn;
	let funky = '"use strict";' + o.actVal.replace(/\{\=([\s\S]*?)\=\}/m, function(_, wot) {
		inn = _handleVarsInJS(ActiveCSS._sortOutFlowEscapeChars(wot));
		return inn;
	});
	let _activeVarScope = (o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main';
	scopedVars[_activeVarScope] = (scopedVars[_activeVarScope] === undefined) ? {} : scopedVars[_activeVarScope];
	try {
		Function('scopedVars, _activeVarScope', funky)(scopedVars, _activeVarScope);		// jshint ignore:line
	} catch (err) {
		console.log('Function syntax error (' + err + '): ' + funky);
	}
};

_a.ScrollIntoView = o => {
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
	if (o.secSel == 'body') {
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
	if (o.secSel == 'body') {
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
	o.actVal = o.actVal._ACSSSpaceQuoIn();
	let attrArr = o.actVal.split(' ');
	attrArr[1] = _handleQuoAjax(o, attrArr[1])._ACSSSpaceQuoOut();
	o.secSelObj.setAttribute(attrArr[0], attrArr[1]);
};

_a.SetClass = o => {
	let str = o.actVal.replace(/\./g, '')._ACSSRepQuo();
	_setClassObj(o.secSelObj, str);
};

/*	From MDN.
Set-Cookie: <cookie-name>=<cookie-value> 
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None
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
		let numTest = new RegExp('^\\d+$');
		if (!numTest.test(maxAge)) console.log('set-cookie error: maxAge is not a number.');
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
	o.actVal = o.actVal._ACSSSpaceQuoIn();
	let attrArr = o.actVal.split(' ');
	attrArr[1] = _handleQuoAjax(o, attrArr[1])._ACSSSpaceQuoOut();
	o.secSelObj[attrArr[0]] = (attrArr[1] == 'true') ? true : (attrArr[1] == 'false') ? false : attrArr[1];
};

_a.StopImmediateEventPropagation = o => {
	// Don't bubble up the Active CSS component event hierarchy and don't run any more events for this current element also.
	if (typeof o.obj == 'object') o.obj.activeStopEvProp = true;
};

_a.StopImmediatePropagation = o => {
	// Don't bubble up Active CSS events and stop propagation in the browser too.
	if (o.e) o.e.stopImmediatePropagation();
	if (typeof o.obj == 'object') o.obj.activeStopProp = true;
};

_a.StopPropagation = o => {
	// Don't bubble up Active CSS events and stop propagation in the browser too.
	if (o.e) o.e.stopPropagation();
	if (typeof o.obj == 'object') o.obj.activeStopProp = true;
};

_a.Style = o => {
	let str = _handleQuoAjax(o, o.actVal);
	let wot = str.split(' '), prop = wot.shift();
	o.secSelObj.style[prop] = wot.join(' ');
};

_a.TakeClass = o => {
	if (o.doc != document) {
		console.log('Active CSS error - you cannot take a class if the element clicked on is not going to take the class. With iframes, use give-class instead.');
		return false;
	}
	// Take class away from any element that has it.
	let cl = o.actVal.substr(1);
	_eachRemoveClass(cl, cl, o.doc);
	_a.AddClass(o);
};

_a.ToggleClass = o => {
	let str = o.actVal.replace(/\./g, '');
	_toggleClassObj(o.secSelObj, str);
};

_a.Trigger = o => {
	if (typeof o.obj === 'string' && o.obj.indexOf('{@') === -1 && o.obj.indexOf('{$') === -1 && !['~', '|'].includes(o.obj.substr(0, 1))) {
		// This is a string, and we need the real objects, so do a queryselectorall.
		o.doc.querySelectorAll(o.obj).forEach(function (obj, i) {
			if (['~'].includes(o.secSel.substr(0,1))) {
				// This is a trigger on a custom selector. Pass the available objects in case they are needed.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), origObj: obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			} else {
				// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			}
		});
	} else {
		if (typeof o.secSel == 'string' && ['~'].includes(o.secSel.substr(0, 1))) {
			// This is a trigger on a custom selector. Pass the available objects in case they are needed.
			_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), origObj: (o.obj || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		} else {
			// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
			// Is this a draw event? If so, we also want to run all draw events for elements within.
			if (o.actVal == 'draw') {
				_runInnerEvent(o.secSelObj, 'draw');
			} else {
				_handleEvents({ obj: o.secSelObj, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			}
		}
	}
};

_a.TriggerReal = o => {
	// Simulate a real event, not just a programmatical one.
	if (!o.secSelObj.isConnected) {
		// Skip it if it's no longer there and cancel all Active CSS bubbling.
		_a.StopPropagation(o);
		return;
	}
	try {
		o.secSelObj.addEventListener(o.actVal, function(e) {}, {capture: true, once: true});	// once = automatically removed after running.
		o.secSelObj[o.actVal]();
	} catch(err) {
		console.log('Active CSS error: Only DOM events support trigger-real.');
	}
};

_a.UrlChange = o => {
	// Check that url-change hasn't been just run, as if so we don't want to run it twice.
	// Check if there is a page-title in the rules. If so, this needs to be set at the same time, so we know what
	// url to go back to.
	let wot = o.actVal.split(' ');
	let url = wot[0];
	let titl = o.actVal.replace(url, '').trim();
	if (titl == '') {
		// default to current title if no parameter set.
		titl = document.title;
	}
	_urlTitle(url, titl, o);
};

_a.Var = o => {
	// Get the name of the variable on the left.
	let arr = o.actVal.trim().split(' ');
	let varName = arr.shift();

	// Get the expression on the right.
	let varDetails = arr.join(' ');

	if (!varDetails) {
		// A right-hand expression is needed, unless it a ++ or a -- operator is being used.
		if (varName.endsWith('++')) {
			varName = varName.slice(0, -2);
			varDetails = varName + '+1';
		} else if (varName.endsWith('--')) {
			varName = varName.slice(0, -2);
			varDetails = varName + '-1';
		} else {
			// Display an error and barf out.
			console.log('Active CSS error: Invalid command "var: ' + varName + ';" needs an expression to be assigned.');
			return;
		}
	}

	// Add in correct scoped variable locations.
	varName = _prefixScopedVars(varName, o.compRef, 'varname');
	varDetails = _prefixScopedVars(varDetails, o.compRef);

	// Set up left-hand variable for use in _set() later on.
	let scopedVar, isWindowVar = false;
	if (varName.substr(0, 7) == 'window.') {
		// Leave it as it is - it's a variable in the window scope.
		isWindowVar = true;
		scopedVar = varName;
	} else {
		scopedVar = varName;
		let prefix = (o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main';
		scopedVar = scopedVar.replace('scopedVars.' + prefix + '.', '');	// We don't want the first part of the left-hand variable to contain "scopedVars.".
		scopedVar = prefix + '.' + scopedVar;
		// Note: That may look weird, but it needs to do the above in order to correctly handle initially undefined variables that will not get the prefix from
		// _prefixScopedVars() the first time the var command is run, because the left-hand variable is undefined.
		// Only a defined variable gets the scoped prefix when _prefixScopedVars() is run on it.
		// So we have to do the above to ensure the prefix is there the first time the var is declared.
	}
	// Resolve inner bracket variables (only) with their true values on the left-hand of the equation now that they are scoped.
	scopedVar = _resolveInnerBracketVars(scopedVar);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedVars." as a prefix where it is needed.
	varDetails = '{=' + varDetails + '=}';
	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	let expr = _replaceJSExpression(varDetails, true, null, o.compRef);	// realVal=false, quoteIfString=false

	// Set the variable in the correct scope.
	if (isWindowVar) {
		// Window scope.
//		console.log('Set in window scope ' + scopedVar + ' = ', expr);		// handy - don't remove
		_set(window, scopedVar, expr);
	} else {
		// Active CSS component/document scopes.
//		console.log('Set ' + scopedVar + ' = ', expr);		// handy - don't remove
		_set(scopedVars, scopedVar, expr);
	}
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

ActiveCSS.trigger = (sel, ev, compRef, compDoc, component) => {
	/* API command */
	/* Possibilities:
	ActiveCSS.trigger('~restoreAfterTinyMCE', 'custom');		// Useful for calling random events.
	ActiveCSS.trigger(o.obj, 'customCancel');	// Useful for external function to call a custom event on the initiating object.

	// This needs to be expanded to include ajaxobj, e and obj, so an after trigger can continue. FIXME at some point.
	*/
	// Subject to conditionals.
	if (typeof sel == 'object') {
		// This is an object that was passed.
		_handleEvents({ obj: sel, evType: ev, compRef: compRef, compDoc: compDoc, component: component });
	} else {
		_a.Trigger({ secSel: sel, actVal: ev, compRef: compRef, compDoc: compDoc, component: component });
	}
};

ActiveCSS.triggerReal = (obj, ev, compRef, compDoc, component) => {
	if (typeof obj === 'string') {
		obj = document.querySelector(obj);
	}
	if (obj) {
		_a.TriggerReal({ secSelObj: obj, actVal: ev, compRef: compRef, compDoc: compDoc, component: component });
	} else {
		console.log('No object found in document to triggerReal.');
	}
};

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

_c.IfDisplay = o => {
	let el = o.doc.querySelector(o.actVal);
	return (el && getComputedStyle(el, null).display !== 'none');
};

_c.IfEmpty = o => { return (_selCompare(o, 'eM')); };

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
			console.log('Active CSS: Function ' + o.actVal + ' does not exist.');
			return false;
		}
	}
};

_c.IfHasClass = o => {
	let arr = _actValSelItem(o);
	return (arr[0] && ActiveCSS._hasClassObj(arr[0], arr[1].substr(1)));		// Used by extensions.
};

_c.IfInnerHtml = o => { return (_selCompare(o, 'iH')); };	// Used in core unit testing.

_c.IfInnerText = o => { return (_selCompare(o, 'iT')); };

_c.IfMaxLength = o => { return (_selCompare(o, 'maL')); };

_c.IfMediaMaxWidth = o => {
	// This could get stored in a variable with an event listener rather than running each time. Probably not worth the overhead though.
	let mq = window.matchMedia('all and (max-width: ' + o.actVal + ')');
	return mq.matches;
};

_c.IfMediaMinWidth = o => {
	// This could get stored in a variable with an event listener rather than running each time. Probably not worth the overhead though.
	let mq = window.matchMedia('all and (min-width: ' + o.actVal + ')');
	return mq.matches;
};

_c.IfMinLength = o => { return (_selCompare(o, 'miL')); };

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

_c.IfVar = o => {
	// This caters for scoped variable and also window variable comparison. If the variable isn't in the scope, it takes the window variable if it is there.
	// First parameter is the variable name.
	// Second parameter is a string, number or boolean. Any JavaScript expression ({= ... =} clauses) has already been evaluated.
	// This also takes only one parameter, in which case it is checked for evaluating to boolean true.

	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl = actVal.split(' ');
	if (spl.length == 1) {
		// Run if-var-true.
		return _ifVarTrue(o.actVal, o.compRef);
	} else {
		let varName = spl.shift();	// Remove the first element from the array.
		let compareVal = spl.join(' ')._ACSSSpaceQuoOut();
		compareVal = (compareVal == 'true') ? true : (compareVal == 'false') ? false : compareVal;
		if (typeof compareVal == 'string' && compareVal.indexOf('"') === -1) {
			compareVal = Number(compareVal._ACSSRepQuo());
		} else {
			compareVal = compareVal._ACSSRepQuo();
		}
		let scopedVar = ((o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main') + '.' + varName;
		let varValue = _get(scopedVars, scopedVar);
		if (varValue === undefined) {
			varValue = window[varName];
		}
		return (typeof varValue == typeof compareVal && varValue == compareVal);
	}
};

_c.IfVarTrue = o => { return _ifVarTrue(o.actVal, o.compRef); };

_c.IfVisible = o => { return ActiveCSS._ifVisible(o); };	// Used by extensions.

/* Internal conditional command only */
_c.MqlTrue = o => { return mediaQueries[o.actVal].val; };

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
};

const _delaySplit = (str, typ, compRef) => {
	// Return an array containing an "after" or "every" timing, and any label (label not implemented yet).
	// Ignore entries in double quotes. Wipe out the after or every entries after handling.
	let regex, convTime, theLabel;
	regex = new RegExp('(' + typ + ' (stack|([\\{]?[\\@]?[\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w_\\-\\.\\:\\[\\]]+[\\}]?)(s|ms)))(?=(?:[^"]|"[^"]*")*)', 'gm');
	str = str.replace(regex, function(_, wot, wot2, delayValue, delayType) {
		if (delayValue && delayValue.indexOf('{') !== -1) {
			// Remove any curlies. The variable if there will be evaluated as it is, in _replaceJSExpression. Only one variable is supported.
			delayValue = delayValue.replace(/[\{\}]+/g, '');
			// Replace any scoped variables that may be in the timer value.
			convTime = _replaceJSExpression('{=' + delayValue + '=}', true, false, compRef) + delayType;
		} else {
			convTime = wot2;
		}
		convTime = _convertToMS(convTime, 'Invalid delay number format: ' + wot);
		return '';
	});
	// "after" and "every" share the same label. I can't think of a scenario where they would need to have their own label, but this functionality may need to be
	// added to later on. Maybe not.
	str = str.replace(/(label [\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)(?=(?:[^"]|"[^"]*")*)$/gm, function(_, wot) {
		// Label should be wot.
		theLabel = wot.split(' ')[1];
		return (typ == 'every') ? '' : wot;
	});
	return { str: str.trim(), tim: convTime, lab: theLabel };
};

const _removeCancel = (delayRef, func, actPos, intID, loopRef) => {
	if (delayArr[delayRef] && delayArr[delayRef][func] && delayArr[delayRef][func][actPos] && delayArr[delayRef][func][actPos][intID]) {
		let tid = delayArr[delayRef][func][actPos][intID][loopRef];
		if (tid && labelByIDs[tid]) {
			let delData = labelByIDs[tid];
			labelByIDs.splice(labelByIDs.indexOf[tid]);
			delete labelData[delData.lab];
		}
		delayArr[delayRef][func][actPos][intID][loopRef] = null;
	}
	if (['~', '|'].includes(delayRef.substr(0, 1))) {
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][func] && cancelCustomArr[delayRef][func][actPos] && cancelCustomArr[delayRef][func][actPos][intID]) {
			cancelCustomArr[delayRef][func][actPos][intID][loopRef] = null;
		}
	} else {
		if (cancelIDArr[delayRef] && cancelIDArr[delayRef][func]) {
			cancelIDArr[delayRef][func] = null;
		}
	}
};

const _setupLabelData = (lab, del, func, pos, intID, loopRef, tid) => {
	delayArr[del][func][pos][intID][loopRef] = tid;
	if (lab) {
		labelData[lab] = { del, func, pos, intID, loopRef, tid };
		// We don't want to be loop or sorting for performance reasons, so we'll just create a new array to keep track of the data we need for later.
		// Note this ES6 syntax is equivalent to del: del, etc.
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

const _actionValLoop = (oCopy, pars, obj, runButElNotThere) => {
	let i, { loopI, actVals, actValsLen } = pars;
	for (i = 0; i < actValsLen; i++) {
		// Loop over the comma-delimited actions.
		oCopy.actVal = actVals[i].trim();	// Put the original back.
		oCopy.actPos = i;	// i or label (not yet built).
		oCopy.secSelObj = obj;
		_handleFunc(oCopy, null, runButElNotThere);
	}
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
	el.setAttribute('data-active-nav', '1');
};

const _handleClickOutside = el => {
	// Does this element pass the click outside test?
	// Iterate the click outside selectors from the config.
	let cid, clickOutsideObj;
	for (cid in clickOutsideSels) {
		// Check the state of the clickoutside for this container. Will be true if active.
		if (clickOutsideSels[cid][0]) {
			// Does this clicked object exist in the clickoutside main element?
			clickOutsideObj = idMap[cid];
			if (clickOutsideObj && !clickOutsideObj.contains(el)) {
				// This is outside.
				if (_handleEvents({ obj: clickOutsideObj, evType: 'clickoutside', otherObj: el })) {	// clickoutside sends the target also.
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
	let obj = evObj.obj;
	let evType = evObj.evType;
	let onlyCheck = evObj.onlyCheck;
	let otherObj = evObj.otherObj;
	let eve = evObj.eve;
	let afterEv = evObj.afterEv;
	let origObj = evObj.origObj;
	let runButElNotThere = evObj.runButElNotThere;
	let compRef, thisDoc;
	let compDoc = evObj.compDoc;
	thisDoc = (compDoc) ? compDoc : document;
	let topCompRef = evObj.compRef;
	let component = (evObj.component) ? '|' + evObj.component : null;
	// Note: obj can be a string if this is a trigger, or an object if it is responding to an event.
	if (typeof obj !== 'string' && !obj || !selectors[evType] || evType === undefined) return false;	// No selectors set for this event.
	let selectorList = [];
	// Handle all selectors.
	let selectorListLen = selectors[evType].length;
	let i, testSel, debugNot = '', compSelCheckPos;
	if (evType == 'draw') obj._acssDrawn = true;	// Draw can manually be run twice, but not by the core as this is checked elsewhere.
	if (typeof obj !== 'string') {
		let runGlobalScopeEvents = true;
		if (component && !(evType == 'draw' && customTags.indexOf(obj.tagName) !== -1)) {
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
			// We stop a component going up the tree after we hit a component mode of "closed". Everything inside a closed component is isolated from anything
			// higher up.
			// We bomb out immediately if the developer has used the prevent-event-default action command.
			// This is all managed before running any events on an object. We make a valid event selector list first and then do the work.
			// This next bit creates the valid list.
			let checkCompRef = topCompRef, checkComponent = component, privateEvents = compPrivEvs[topCompRef], parentComponentDetails;
			while (true) {
				for (i = 0; i < selectorListLen; i++) {
					compSelCheckPos = selectors[evType][i].indexOf(':');
					if (selectors[evType][i].substr(0, compSelCheckPos) !== checkComponent) continue;
					testSel = selectors[evType][i].substr(compSelCheckPos + 1);
					// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
					testSel = (afterEv && origObj) ? _replaceAttrs(origObj, testSel) : testSel;
					if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[evType][i])) {
					    if (testSel == '&') {
							selectorList.push(selectors[evType][i]);
					    } else {
						    try {
								if (obj.matches(testSel)) {
									selectorList.push(selectors[evType][i]);
						    	}
						    } catch(err) {
						        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
							}
						}
					}
				}
				parentComponentDetails = compParents[checkCompRef];
				if (!privateEvents && ['beforeComponentOpen', 'componentOpen'].indexOf(evType) === -1) {
					if (parentComponentDetails.compRef) {
						checkCompRef = parentComponentDetails.compRef;
						checkComponent = '|' + parentComponentDetails.component;
						privateEvents = parentComponentDetails.privateEvs;	// If the next component mode is set to closed, we won't go any higher than this.
						continue;
					}
				} else {
					// This component is closed. We don't go any higher.
					runGlobalScopeEvents = false;
				}
				break;
			}
    	}
    	if (runGlobalScopeEvents) {
			for (i = 0; i < selectorListLen; i++) {
				if (['~', '|'].includes(selectors[evType][i].substr(0, 1))) continue;
				// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
				testSel = (afterEv && origObj) ? _replaceAttrs(origObj, selectors[evType][i]) : selectors[evType][i];
				if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[evType][i])) {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push(selectors[evType][i]);
				    	}
				    } catch(err) {
				        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
					}
				}
			}
		}
	} else {
		// This has taken in a string to select - just search for that string. Note this could be a shadow DOM element, which for speed has come in as a string sel.
		selectorList.push(obj);
		obj = (origObj) ? origObj : obj;
	}

	let sel, chilsObj;
	component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.

	selectorListLen = selectorList.length;
	let actionName, ifrSplit, ifrObj, conds = [], cond, condSplit, passCond;
	let clause, clauseCo = 0, clauseArr = [];
	// All conditionals for a full event must be run *before* all actions, otherwise we end up with confusing changes within the same event which makes
	// setting conditionals inconsistent. Like checking if a div is red, then setting it to green, then checking if a div is green and setting it to red.
	// Having conditionals dynamically checked before each run of actions means the actions cancel out. So therein lies confusion. So all conditionals
	// must be for a specific event on a selector *before* all actions. We get two "for" loops, but I don't see an alternative right now.
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][evType]) {
			if (onlyCheck) return true;	// Just checking something is there. Now we have established this, go back.
			for (clause in config[selectorList[sel]][evType]) {
				clauseCo++;
				if (clause != '0' && _passesConditional(obj, sel, clause, evType, otherObj, thisDoc, topCompRef, component, eve, compDoc)) {
					// This condition passed. Remember it for the next bit.
					clauseArr[clauseCo] = clause;
				}
			}
		}
	}
	clauseCo = 0;
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][evType]) {
			for (clause in config[selectorList[sel]][evType]) {
				clauseCo++;
				passCond = '';
				if (clause != '0') {	// A conditional is there.
					if (clauseArr[clauseCo] === undefined) continue;	// The conditional failed earlier.
					// This conditional passed earlier - we can run it.
					passCond = clauseArr[clauseCo];
				}
				chilsObj = config[selectorList[sel]][evType][clause];
				if (chilsObj !== false) {
					// Secondary selector loops go here.
					let secSelLoops, loopObj;
					for (secSelLoops in chilsObj) {
						loopObj = {
							chilsObj,
							originalLoops: secSelLoops,
							secSelLoops,
							obj,
							compDoc,
							evType,
							compRef: topCompRef,
							evObj,
							otherObj,
							passCond,
							sel,
							component,
							selectorList,
							eve,
							runButElNotThere
						};
						_performSecSel(loopObj);
					}
				}
				if (obj && obj.activeStopEvProp) {
					// If the developer has used stop-immediate-event-propagation, we break out at this point.
					break;
				}
			}
		}
		if (obj && (obj.activePrevEvDef || obj.activeStopEvProp)) {
			// If the developer has used prevent-event-default, we break out at this point.
			break;
		}
	}
	return true;
};

const _handleFunc = function(o, delayActiveID=null, runButElNotThere=false) {
	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = o.secSel;
	} else {
		// Note: re runButElNotThere) {
		// "runButElNotThere" is a custom element disconnect callback. We know the original object is no longer on the page, but we still want to run functions.
		// If the original object that has been removed is referenced in the code, this is an error by the user.
		if (!runButElNotThere && !o.secSelObj.isConnected) {
			// Skip it if the object is no longer there and cancel all Active CSS bubbling.
			if (delayActiveID) {
				// Cleanup any delayed actions if the element is no longer there.
				if (delayArr[delayActiveID]) {
					// This needs to clear all of the delayed actions associated to an element - not just one, otherwise this could affect performance.
					_unloadAllCancelTimerLoop(delayActiveID);
				}
				delayArr[delayActiveID] = null;
				cancelIDArr[delayActiveID] = null;
				cancelCustomArr[delayActiveID] = null;
			}
			_a.StopPropagation(o);
			// Remove any mapping to this object.
			delete idMap[o.secSelObj];
			return;
		}
		delayRef = _getActiveID(o.secSelObj);
	}

	// Replace any looping variable in the action value at this point, above any delay actions.
	if (o.loopRef != '0') {
		o.actVal = _replaceLoopingVars(o.actVal, o.loopVars);
	}

	// Delayed / interval events need to happen at this level.
	if (o.actVal.match(/(after|every) (stack|(\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\:\[\]]+(\})?(s|ms))(?=(?:[^"]|"[^"]*")*$)/gm)) {
		let o2 = Object.assign({}, o), delLoop = ['after', 'every'], aftEv;
		let splitArr, tid, scope;
		for (aftEv of delLoop) {
			splitArr = _delaySplit(o2.actVal, aftEv, o.compRef);
			scope = (o.compRef) ? o.compRef : 'main';
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
					_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, setTimeout(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
					return;
				}
				o2.interval = true;
				_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
				// Carry on down and perform the first action. The interval has been set.
				o.interval = true;
				o.actValSing = splitArr.str;
			}
		}
	} else {
		o.actValSing = o.actVal;
	}

	// Remove any labels from the command string. We can't remove this earlier, as we need the label to exist for either "after" or "every", or both.
	if (o.actValSing.indexOf('label ') !== -1) {
		o.actValSing = o.actValSing.replace(/(label [\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)(?=(?:[^"]|"[^"]*")*)/gm, '');
	}

	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Has this action been cancelled? If so, skip the action and remove the cancel.
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][o.func] && cancelCustomArr[delayRef][o.func][o.actPos] &&
				cancelCustomArr[delayRef][o.func][o.actPos][o.intID] && cancelCustomArr[delayRef][o.func][o.actPos][o.intID][o.loopRef]
			) {
			_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
			return;
		}
	}

	// Is this a non-delayed action, if so, we can skip the cancel check.
	if (o.delayed && cancelIDArr[delayRef] && cancelIDArr[delayRef][o.func]) return;

	if (o.func == 'Var') {
		// Special handling for var commands, as each value after the variable name is a JavaScript expression, but not within {= =}, to make it quicker to type.
		o.actValSing = o.actValSing.replace(/__ACSS_int_com/g, ',');
	}

	o.actVal = _replaceAttrs(o.obj, o.actValSing, o.secSelObj, o, o.func, o.compRef);

	// Show debug action before the function has occured. If we don't do this, the commands can go out of sequence in the Panel and it stops making sense.
	if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
		_debugOutput(o);	// A couple of extra objects variables are set in here, and we want them later for the feedback results (not yet implemented fully).
	}

	if (typeof _a[o.func] !== 'function') {
		// Apply this as a CSS style if it isn't a function.
		o.secSelObj.style[o.actName] = o.actVal;
	} else {
		// Allow the variables for this scope to be read by the external function - we want the vars as of right now.
		let compScope = ((o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main');
		o.vars = scopedVars[compScope];
		// Run the function.
		_a[o.func](o, scopedVars, privVarScopes);
	}

	if (!o.interval && delayActiveID) {
		// We don't cleanup any timers if we are in the middle of an interval. Only on cancel, or if the element is no longer on the page.
		// Also... don't try and clean up after a non-delayed action. Only clean-up here after delayed actions are completed. Otherwise we get actions being removed
		// that shouldn't be when clashing actions from different events with different action values, but the same everything esle.
		_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
	}

	// Handle general "after" callback. This check on the name needs to be more specific or it's gonna barf on custom commands that contain ajax or load. FIXME!
	if (['LoadConfig', 'LoadScript', 'LoadStyle', 'Ajax', 'AjaxPreGet', 'AjaxFormSubmit', 'AjaxFormPreview'].indexOf(o.func) === -1) {
		if (!runButElNotThere && !o.secSelObj.isConnected) o.secSelObj = undefined;
		_handleEvents({ obj: o.secSelObj, evType: 'after' + o.actName._ACSSConvFunc(), otherObj: o.secSelObj, eve: o.e, afterEv: true, origObj: o.obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	}

};

const _handleLoop = (loopObj) => {
	let originalLoops = loopObj.originalLoops;
	let compRef = loopObj.compRef;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';
	let existingLoopVars = (loopObj.loopVars) ? loopObj.loopVars : [];

	// Which type of loop is it?
	// This is here for when we start adding different types of loops. For now we don't need the check.
	if (originalLoops.substr(0, 6) == '@each ') {
		// eg. @each name in person
		// eg. @each name, age in person
		// etc.
		// It limits variables to the scope we are in.
		let inPos = originalLoops.indexOf(' in ');
		let leftVar = originalLoops.substr(6, inPos - 6);
		let leftVars, eachLeftVar;
		if (leftVar.indexOf(',') !== -1) {
			// There is more than one left-hand assignment.
			leftVars = leftVar.split(',');
		}
		let rightVar = originalLoops.substr(inPos + 4);
		// Note that we don't use the real value of the list object in the *replacement* value - it evaluates in the scope dynamically, so we don't attach the scope.
		let thisScope = ((compRef && privVarScopes[compRef]) ? compRef : 'main') + '.';
		let rightVarReal = thisScope + rightVar;

		let rightVarVal;
		if (existingLoopVars[rightVar] !== undefined) {
			rightVarVal = _get(scopedVars, thisScope + existingLoopVars[rightVar]);
			// We need the real variable reference, so reassign rightVar.
			rightVar = existingLoopVars[rightVar];
		} else {
			rightVarVal = _get(scopedVars, rightVarReal);
		}
		if (rightVarVal === undefined) {
			console.log('Active CSS error: ' + rightVarReal + ' is not defined - skipping loop.');
			return;
		}

		// The variables themselves get converted internally to the actual variable reference. By doing this, we can circumvent a whole bunch of complexity to do
		// with setting up new variables, and handling {{var}} variable binding, as internally we are referring to the real variable and not the config reference.
		// We do this by reading and replacing the remainder of this particular object with the correct values.
		// We keep the original object, and make copies for use in _performSecSel as we do the following looping.
		let newRef, loopObj2, i, j, key, val;
		if (Array.isArray(rightVarVal)) {
			// Get the rightVar for real and loop over it.
			let rightVarValLen = rightVarVal.length;
			for (i = 0; i < rightVarVal.length; i++) {
				// Make a copy of loopObj. We're going to want original copies every time we substitute in what we want.
				loopObj2 = Object.assign({}, loopObj);
				if (!loopObj2.loopVars) loopObj2.loopVars = {};
				if (!leftVars) {
					// Single level array.
					newRef = rightVar + '[' + i + ']';
					existingLoopVars[leftVar] = newRef;
					loopObj2.loopRef = existingLoopRef + leftVar + '_' + i;
				} else {
					// Two dimensional array.
					for (j in leftVars) {
						eachLeftVar = leftVars[j].trim();
						newRef = rightVar + '[' + i + ']' + '[' + j + ']';
						existingLoopVars[eachLeftVar] = newRef;
					}
					loopObj2.loopRef = existingLoopRef + leftVars[0] + '_' + i;	// This will expand to include nested loop references and still needs work as this references multiple items.
				}
				loopObj2.loopVars = existingLoopVars;
				_performSecSel(loopObj2);
			}
		} else {
			let objValVar, co = 0;
			for ([key, val] of Object.entries(rightVarVal)) {
				loopObj2 = Object.assign({}, loopObj);
				if (!loopObj2.loopVars) loopObj2.loopVars = {};
				if (!leftVars) {
					// Only referencing the key in the key, value pair. We just place the key value straight in - there is no auto-var substitution for a key.
					// See _replaceLoopingVars for how this '-_-' works. It just places the value in, basically, and not a variable reference.
					existingLoopVars[leftVar] = '-_-' + key;
					loopObj2.loopRef = existingLoopRef + leftVar + '_0_' + co;
				} else {
					existingLoopVars[leftVars[0]] = '-_-' + key;
					loopObj2.loopRef = leftVars[0] + '_0_' + co;
					objValVar = leftVars[1].trim();
					newRef = rightVar + '.' + key;
					existingLoopVars[objValVar] = newRef;
					loopObj2.loopRef = existingLoopRef + objValVar + '_1_' + co;
				}
				co++;
				loopObj2.loopVars = existingLoopVars;
				_performSecSel(loopObj2);
			}				
		}
	}
};

const _handleVarsInJS = function(str) {
	/**
	 * "str" is the full JavaScript content that is being prepared for evaluation.
	 * This function finds any "vars" line that declares any Active CSS variables that will be used, and locates and substitutes these variables into the code
	 * before evaluation. A bit like the PHP "global" command, except in this case we are not declaring global variables. We are limiting all variables to the
	 * scope of Active CSS. All the ease of global variables, but they are actually contained within Active CSS and not available outside Active CSS. Global variables can still
	 * be used by using window['blah']. But private variables to Active CSS is, and should always be, the default.
	 * 1. Names of variables get substituted with reference to the scopedVars container variable for the scoped variables, which is private to the Active CSS IIFE.
	 *		This is literally just an insertion of "scopedVars." before any matching variable name.
	 * 2. Variables enclosed in curlies get substituted with the value of the variable itself. This would be for rendered contents.
	 * Note: This could be optimised to be faster - there's bound to be some ES6 compatible regex magic that will do the job better than this.
	*/
	let mapObj = {}, mapObj2 = {};
	let found = false;
	str = str.replace(/[\s]*vars[\s]*([\u00BF-\u1FFF\u2C00-\uD7FF\w_\, ]+)[\s]*\;/gi, function(_, varList) {
		// We should have one or more variables in a comma delimited list. Split it up.
		let listArr = varList.split(','), thisVar;
		// Remove dupes from the list by using the Set command.
		listArr = [...new Set(listArr)];
		let negLook = '(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)';
		found = true;
		for (thisVar of listArr) {
			thisVar = thisVar.trim();
			mapObj[negLook + '(' + thisVar + ')' + negLook] = '';
			mapObj2[thisVar] = 'scopedVars[_activeVarScope].' + thisVar;
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
		str = ActiveCSS._mapRegexReturn(mapObj, str, mapObj2);
		// Remove any substituted vars prefixes in quotes, as the user won't want to see those in their internal form.
		// There's probably a faster way of doing this, but my regex brain isn't totally switched on today. Help if you can!
		// Just want to remove any /scopedVars\[_activeVarScope\]\./ anywhere in single or double quotes catering for escaped quotes.
		str = str.replace(/(["|'][\s\S]*?["|'])/gim, function(_, innards) {
			return innards.replace(/scopedVars\[_activeVarScope\]\./g, '');
		});
		str = str.replace(/cjs_tmp\-dq"/g, '\\"');
		str = str.replace(/cjs_tmp\-sq/g, "\\'");
	}
	return str;
};

const _mainEventLoop = (typ, e, component, compDoc, compRef) => {
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
	if (typ == 'mouseover' && !bod) {
		if (el.tagName == 'A' && el['data-active-nav'] !== 1) {
			// Set up any attributes needed for navigation from the routing declaration if this is being used.
			_setUpNavAttrs(el);
		}
	}

	if (typ == 'click' && e.primSel != 'bypass') {
		// Check if there are any click-away events set.
		// true above here means just check, don't run.
		if (clickOutsideSet && !_handleClickOutside(el)) {
			if (!e.primSel) {
				e.preventDefault();
			}
			return false;
		}
	}

	let composedPath;

	composedPath = _composedPath(e);
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
		for (el of composedPath) {
			if (el.nodeType !== 1) continue;
			// This could be an object that wasn't from a loop. Handle any ID or class events.
			if (typ == 'click' && el.tagName == 'A' && el['data-active-nav'] !== 1) {
				// Set up any attributes needed for navigation from the routing declaration if this is being used.
				_setUpNavAttrs(el);
			}
			// Is this in the document root or a shadow DOM root?
			compDetails = _componentDetails(el);
			_handleEvents({ obj: el, evType: typ, eve: e, component: compDetails.component, compDoc: compDetails.compDoc, compRef: compDetails.compRef });
			if (!el || !e.bubbles || el.tagName == 'BODY' || el.activeStopProp) break;		// el can be deleted during the handleEvent.
		}
		if (el && el.activeStopProp) {
			el.activeStopProp = false;
		} else {
			if (document.parentNode) _handleEvents({ obj: window.frameElement, evType: typ, eve: e });
		}
	}
};

// This function is incomplete and mentioned in an outstanding ticket.
ActiveCSS._nodeMutations = function(mutations) {
	mutations.forEach(mutation => {
		if (mutation.type == 'childList' && mutation.removedNodes) {
			mutation.removedNodes.forEach(nod => {
				let activeID = nod.acssActiveID;

				idMap.splice(idMap.indexOf(nod), 1);
				varInStyleMap.splice(varInStyleMap.indexOf(activeID), 1);
			});
		}
	});
};

const _passesConditional = (el, sel, condList, thisAction, otherEl, doc, compRef, component, eve, compDoc) => {
	// This takes up any conditional requirements set. Checks for "conditional" as the secondary selector.
	// Note: Scoped shadow conditionals look like "|(component name)|(conditional name)", as opposed to just (conditional name).

	let firstChar, chilsObj, key, obj, func, excl, i, checkExcl, exclLen, eType, eActual, exclArr, exclTargs, exclDoc, iframeID, res, aV;
	// Loop conditions attached for this check. Split conditions by spaces not in parentheses.
	let cond, conds = condList.split(/ (?![^\(\[]*[\]\)])/), rules, exclusions, nonIframeArr = [];
	let elC = (thisAction == 'clickoutside' && otherEl) ? otherEl : el;	// use click target if clickoutside.
	let actionBoolState = false;
	let newCondVal, condVals, condValsLen, n;

	for (cond of conds) {
		let parenthesisPos = cond.indexOf('(');
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
			if (typeof _c[func] === 'function') {
				// Comma delimit for multiple checks in the same function.
				let aV = cond.slice(parenthesisPos + 1, -1).trim().replace(/"[^"]*"|(\,)/g, function(m, c) {
					// Split conditionals by comma.
				    if (!c) return m;
				    return '_ACSSComma';
				});

				aV = _replaceAttrs(el, aV, null, null, null, compRef);	// Using the document of the primary selector is what we want.
				aV = (otherEl && otherEl.loopRef != '0') ? _replaceLoopingVars(aV, otherEl.loopVars) : aV;

				condVals = aV.split('_ACSSComma');
				condValsLen = condVals.length;
				for (n = 0; n < condValsLen; n++) {
					if (_c[func]({
						'func': func,
						'actName': commandName,
						'secSel': 'conditional',
						'secSelObj': el,
						'actVal': condVals[n].trim(),
						'primSel': sel,
						'rules': cond,
						'obj': el,
						'e': eve,
						'doc': doc,
						'ajaxObj': otherEl,
						'component': component,
						'compDoc': compDoc,
						'compRef': compRef
					}, scopedVars, privVarScopes) !== actionBoolState) {
						return false;	// Barf out immediately if it fails a condition.
					}
				}
			}
			continue;
		}
		if (component) {
			cond = '|' + component + '|' + cond;
			if (conditionals[cond] === undefined) {
				let condErr = cond.substr(component.length + 2);
				console.log('Active CSS error: Conditional ' + condErr + ' not found in config for component ' + component);
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
				if (typeof _c[func] === 'function') {
					// Call the conditional function is as close a way as possible to regular functions.

					// Comma delimit for multiple checks on the same statement.
					let aV = obj.value.replace(/"[^"]*"|(\,)/g, function(m, c) {
						// Split conditionals by comma.
					    if (!c) return m;
					    return '_ACSSComma';
					});

					aV = _replaceAttrs(el, aV, null, null, null, compRef);	// Using the document of the primary selector is what we want.
					aV = (otherEl && otherEl.loopRef != '0') ? _replaceLoopingVars(aV, otherEl.loopVars) : aV;

					condVals = aV.split('_ACSSComma');
					condValsLen = condVals.length;
					for (n = 0; n < condValsLen; n++) {
						if (_c[func]({
							'func': func,
							'actName': obj.name,
							'secSel': 'conditional',
							'secSelObj': el,
							'actVal': condVals[n].trim(),
							'primSel': sel,
							'rules': rules,
							'obj': el,
							'e': eve,
							'doc': doc,
							'ajaxObj': otherEl,
							'component': component,
							'compDoc': compDoc,
							'compRef': compRef
						}, scopedVars, privVarScopes) !== actionBoolState) {
							return false;	// Barf out immediately if it fails a condition.
						}
					}
				}
			}
		} else {
			// Check if this is a direct reference to a conditional command.
			console.log('Active CSS error: Conditional ' + cond + ' not found in config for document scope.');
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
	_performActionDo(o, null, runButElNotThere);
};

const _performActionDo = (o, loopI=null, runButElNotThere=false) => {
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
	if (o.func == 'Var') {
		// Special handling for var commands, as each value is a JavaScript expression, but not in {= =}, to make it quicker to type.
		newActVal = ActiveCSS._sortOutFlowEscapeChars(newActVal);
		// Now escape any commas inside any kind of brackets.
		newActVal = _escCommaBrack(newActVal, o);
	}
	// Store the original copies of the action values before we start looping secSels.
	let actValsLen, actVals = newActVal.split('_ACSSComma'), comm, activeID;
	actValsLen = actVals.length;
	let pars = { loopI: loopI, actVals: actVals, actValsLen: actValsLen };
	if (typeof o.secSel == 'string' && !['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Loop objects in secSel and perform the action on each one. This enables us to keep the size of the functions down.
		let checkThere = false, activeID;
		if (o.secSel == '#') {
			console.log('Error: ' + o.primSel + ' ' + o.event + ', ' + o.actName + ': "' + o.origSecSel + '" is being converted to "#". Attribute or variable is not present.');
		}
		let els = _prepSelector(o.secSel, o.obj, o.doc);
		if (els) {
			els.forEach((obj) => {
				// Loop over each target selector object and handle all the action commands for each one.
				checkThere = true;
				let oCopy = Object.assign({}, o);
				_actionValLoop(oCopy, pars, obj);
			});
		}

/* Pretty sure we don't need this anymore. References to data-activeid in the o.secSel has been replaced by an object and should be covered in the section below this.
		if (!checkThere) {
			// If the object isn't there, we run it with the remembered object, as it could be from a popstate, but only if this is top-level action command.
			// Only by doing this can we ensure that this is an action which will only target elements that exist.
			let oCopy = Object.assign({}, o);
			if (o.secSel.lastIndexOf('data-activeid') !== -1) {
				oCopy.actVal = _replaceAttrs(oCopy.obj, oCopy.actValSing, oCopy.secSelObj, oCopy, oCopy.func, oCopy.compRef);
				_actionValLoop(o, pars, oCopy.obj, runButElNotThere);
			}
		}
*/
	} else {
		let oCopy = Object.assign({}, o);
		// Send the secSel to the function, unless it's a custom selector, in which case we don't.
		if (typeof oCopy.secSel == 'object') {
			_actionValLoop(o, pars, oCopy.secSel);
		} else {
			// Is this a custom event selector? If so, don't bother trying to get the object. Trust the developer doesn't need it.
			if (runButElNotThere || ['~', '|'].includes(oCopy.secSel.substr(0, 1))) {
				_actionValLoop(o, pars, {}, runButElNotThere);
			}
		}
/* 	Feedback commented out for the moment - this will be part of a later extension upgrade.
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			// Show any feedback available at this point. Note ajax call results will feedback elsewhere.
			_debugOutputFeedback(oCopy);
		}
*/
	}
};

const _performSecSel = (loopObj) => {
	let chilsObj = loopObj.chilsObj;
	let secSelLoops = loopObj.secSelLoops;
	let obj = loopObj.obj;
	let compDoc = loopObj.compDoc || document;
	let evType = loopObj.evType;
	let compRef = loopObj.compRef;
	let evObj = loopObj.evObj;
	let otherObj = loopObj.otherObj;
	let passCond = loopObj.passCond;
	let sel = loopObj.sel;
	let component = loopObj.component;
	let selectorList = loopObj.selectorList;
	let eve = loopObj.eve;
	let loopVars = loopObj.loopVars;
	let loopRef = (!loopObj.loopRef) ? 0 : loopObj.loopRef;
	let runButElNotThere = loopObj.runButElNotThere;

	// In a scoped area, the variable area is always the component variable area itself so that variables used in the component are always available despite
	// where the target selector lives. So the variable scope is never the target scope. This is why this is not in _splitIframeEls and shouldn't be.
	if (supportsShadow && compDoc instanceof ShadowRoot) {
		compRef = '_' + compDoc.host._acssActiveID.replace(/id\-/, '');
	} else if (!compDoc.isSameNode(document) && compDoc.hasAttribute('data-active-scoped')) {
		// This must be a scoped component.
		compRef = '_' + compDoc._acssActiveID.replace(/id\-/, '');
	} else {
		compRef = (evObj.compRef) ? evObj.compRef : null;
	}

	// Get the selectors this event is going to apply to.
	let secSelCounter, targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', m, n, tmpSecondaryFunc, actionValue;
	// Loop declarations in sequence.
	for (secSelCounter in chilsObj[secSelLoops]) {
		// Loop target selectors in sequence.
		for (targetSelector in chilsObj[secSelLoops][secSelCounter]) {
			if (targetSelector == 'conds') continue;	// skip the conditions.
			if (targetSelector.indexOf('@each') !== -1) {
				let outerFill = [];
				outerFill.push(chilsObj[secSelLoops][secSelCounter][targetSelector]);
				let innerLoopObj = {
					chilsObj: outerFill,
					originalLoops: targetSelector,
					secSelLoops: '0',
					obj,
					compDoc,
					evType,
					compRef,
					evObj,
					otherObj,
					passCond,
					sel,
					component,
					selectorList,
					eve,
					loopVars,
					loopRef,
					runButElNotThere
				};
				_handleLoop(innerLoopObj);

				continue;
			}
			// Get the correct document/iframe/shadow for this target.
			targs = _splitIframeEls(targetSelector, obj, compDoc);	// Note - here it is compDoc as we are doing this in relation to the 
			if (!targs) continue;	// invalid target.
			doc = targs[0];
			passTargSel = targs[1];

			// passTargSel is the string of the target selector that now goes through some changes.
			if (loopRef != '0') passTargSel = _replaceLoopingVars(passTargSel, loopVars);

			passTargSel = _replaceAttrs(obj, passTargSel, null, null, null, compRef);
			// See if there are any left that can be populated by the passed otherObj.
			passTargSel = _replaceAttrs(otherObj, passTargSel, null, null, null, compRef);
			// Handle functions being run on self.
			if (meMap.includes(passTargSel)) {
				// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
				// It won't work unless we can identify it later and have it selectable as a string.
				if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
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
			let act;
			for (m in chilsObj[secSelLoops][secSelCounter][targetSelector]) {
				if (chilsObj[secSelLoops][secSelCounter][targetSelector][m].name.indexOf('@each') !== -1) {
					let outerFill = [];
					outerFill.push(chilsObj[secSelLoops][secSelCounter][targetSelector][m].value);
					let innerLoopObj = {
						chilsObj: outerFill,
						originalLoops: chilsObj[secSelLoops][secSelCounter][targetSelector][m].name,
						secSelLoops: '0',
						obj,
						compDoc,
						evType,
						compRef,
						evObj,
						otherObj,
						passCond,
						sel,
						component,
						selectorList,
						eve,
						loopVars,
						loopRef,
						runButElNotThere
					};
					_handleLoop(innerLoopObj);

					continue;
				}
				tmpSecondaryFunc = chilsObj[secSelLoops][secSelCounter][targetSelector][m].name._ACSSConvFunc();
				// Generate the object that performs the magic in the functions.
				actionValue = chilsObj[secSelLoops][secSelCounter][targetSelector][m].value;
				// Note: this can be optionally optimised by putting all the rules into the secondary selecor
				// rather than a whole array each time. Micro-optimising, but for a large project it is a good idea.
				act = {
					event: evType,
					func: tmpSecondaryFunc,
					actName: chilsObj[secSelLoops][secSelCounter][targetSelector][m].name,
					secSel: passTargSel,
					origSecSel: targetSelector,	// Used for debugging only.
					actVal: actionValue,
					origActVal: actionValue,
					primSel: selectorList[sel],
					rules: chilsObj[secSelLoops][secSelCounter][targetSelector],
					obj: obj,
					doc: doc,
					ajaxObj: otherObj,
					e: eve,
					passCond: passCond,
					file: chilsObj[secSelLoops][secSelCounter][targetSelector][m].file,
					line: chilsObj[secSelLoops][secSelCounter][targetSelector][m].line,
					intID: chilsObj[secSelLoops][secSelCounter][targetSelector][m].intID,
					activeID: activeTrackObj,
					compRef: compRef,	// unique counter of the shadow element rendered - used for variable scoping.
					compDoc: compDoc,
					component: component,
					loopVars: loopVars,
					loopRef: loopRef
				};
				_performAction(act, runButElNotThere);
			}
		}
	}
};

const _prepSelector = (sel, obj, doc) => {
	// This is currently only being used for target selectors, as action command use of "&" needs more nailing down before implementing - see roadmap.
	// Returns a collection of unique objects for iterating as target selectors.
	let attrActiveID;
	if (sel.indexOf('&') !== -1) {
		// Handle any "&" in the selector.
		// Eg. "& div" becomes "[data-activeid=25] div".
		if (sel.substr(0, 1) == '&') {
			// Substitute the active ID into the selector.
			attrActiveID = _getActiveID(obj);
			// Add the data-activeid attribute so we can search with it. We're going to remove it after. This keeps things simple and quicker than manual traversal.
			obj.setAttribute('data-activeid', attrActiveID);
			sel = sel.replace(/&/g, '[data-activeid=' + attrActiveID + ']');
		}
	}
	if (sel.indexOf('<') === -1) {
		let res = doc.querySelectorAll(sel);
		if (attrActiveID) obj.removeAttribute('data-activeid', attrActiveID);
		return res;
	}
	// Handle "<" selection by iterating in stages. There could be multiple instances of "<".
	let stages = sel.split('<');
	// Get first item of the array, remove it, then get selector before the "<".
	let thisEls = doc.querySelectorAll(stages.shift());
	// thisEls can contain more than one element. In which case we need to run the rest of the closest algorithm on each obj and return the collection.
	// The returned collection will only contain a unique set of objects, so objects will not appear twice in the collection.
	// Means we can do stuff like this:
	// strong < p to get all unique p tags that contain any number of strong tags.
	// It should be noted in the docs that this may have a performance impact if there are a lot of items before the first "<".
	// It is pretty fast though.
	let nextSel, objArr = new Set(), thisEl, parentEl;
	thisEls.forEach((obj) => {
		thisEl = obj;
		for (nextSel of stages) {
			// Get closest nextSel to the current element, but we want to start from the parent. Note that this will always only bring back one node.
			thisEl = thisEl.parentElement;
			if (!thisEl) break;
			thisEl = thisEl.closest(nextSel);
			if (!thisEl) break;
			// If it gets this far and there is another "<", it will take the next closest nextSel up the tree and continue looping.
		}
		if (thisEl) objArr.add(thisEl);
	});
	if (attrActiveID) obj.removeAttribute('data-activeid', attrActiveID);
	return objArr;
};

const _renderCompDoms = (o, compDoc=o.doc, childTree=null) => {
	// Set up any shadow DOM and scoped components so far unrendered and remove these from the pending shadow DOM and scoped array that contains the HTML to draw.
	// Shadow DOM and scoped content strings are already fully composed with valid Active IDs at this point, they are just not drawn yet.
	// Search for any data-acss-component tags and handle.
	compDoc.querySelectorAll('data-acss-component').forEach(function (obj, index) {
		_renderCompDomsDo(o, obj, childTree);

		// Quick way to check if components and scoped variables are being cleaned up. Leave this here please.
		// At any time, only the existing scoped vars and shadows should be shown.
//		console.log('Current shadow DOMs', shadowDoms);
//		console.log('scopedData:', scopedData);
//		console.log('scopedVars:', scopedVars);
//		console.log('actualDoms:', actualDoms);
//		console.log('compParents:', compParents);
	});
};

const _renderCompDomsClean = compRef => {
	delete compPending[compRef];
	// Clean up any shadow DOMs no longer there. Mutation observer doesn't seem to work on shadow DOM nodes. Fix if this is not the case.
	let shadTmp, shadObj;
	for ([shadTmp, shadObj] of Object.entries(shadowDoms)) {
		if (!shadObj.isConnected) {
			// Delete any variables scoped to this shadow. This will also trigger the deletion of the shadow from the shadowDoms object in _varUpdateDom.
			delete scopedVars[shadTmp];
		}
	}
};

const _renderCompDomsDo = (o, obj, childTree) => {
	let shadowParent, privateEvents, parentCompDetails, isShadow, shadRef, compRef, componentName, template, shadow, shadPar, shadEv;

	shadowParent = obj.parentNode;
	parentCompDetails = _componentDetails(shadowParent);

	shadRef = obj.getAttribute('data-ref');
	// Determine if this is a shadow or a scoped component. We can tell if the mode is set or not.
	componentName = obj.getAttribute('data-name');
	privateEvents = components[componentName].privEvs;
	isShadow = components[componentName].shadow;

	// We have a scenario for non-shadow DOM components:
	// Now that we have the parent node, is it a dedicated parent with no other children? We need to assign a very specific scope for event and variable scoping.
	// So check if it already has child nodes. If it does, then it cannot act as a host. Components must have dedicated hosts. So we will add one later.
	// Shadow DOM components already have hosts, so this action of assigning a host if there is not one does not apply to them.
	let scopeEl;
	if (!isShadow && shadowParent.childNodes.length > 1) {
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

	compRef = _getActiveID(shadowParent).replace('id-', '_');
	// Set the variable scope up for this area. It is really important this doesn't get moved otherwise the first variable set in the scope will only initialise
	// the scope and not actually set up the variable, causing a hard-to-debug "variable not always getting set" scenario.
	if (scopedVars[compRef] === undefined) {
		scopedVars[compRef] = {};
	}

	// Set up a private scope reference if it is one so we don't have to pass around this figure.
	// Note that the scope name, the compRef, is not the same as the component name. The compRef is the reference of the unique scope.
	// Hence we need to do this at this point in the code.
	privVarScopes[compRef] = components[componentName].privVars ? true: false;

	// Get the parent component details for event bubbling (not element bubbling).
	// This behaviour is exactly the same for shadow DOMs and non-shadow DOM components.
	// The data will be assigned to the compParents array further down this page once we have the component drawn.
	compParents[compRef] = parentCompDetails;
	compPrivEvs[compRef] = privateEvents;

	compPending[shadRef] = _renderRefElements(compPending[shadRef], childTree, 'CHILDREN');

	// Run a beforeComponentOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeComponentOpen', compRef: compRef, compDoc: undefined, component: componentName });

	compPending[shadRef] = _replaceAttrs(o.obj, compPending[shadRef], null, null, o.func, compRef);
	compPending[shadRef] = _replaceComponents(o, compPending[shadRef]);

	// Now we can go through the shadow DOM contents and handle any host attribute references now that the host is set up.
	compPending[shadRef] = _replaceScopedVars(compPending[shadRef], o.secSelObj, o.func, o, false, shadowParent, compRef);

	// Lastly, handle any {$STRING} value from ajax content if it exists. This must be done last, otherwise we risk var replacement changing content of the $STRING.
	compPending[shadRef] = _replaceStringVars(o.ajaxObj, compPending[shadRef]);

	template = document.createElement('template');
	template.innerHTML = compPending[shadRef];

	// Remove the pending shadow DOM instruction from the array as it is about to be drawn, and some other clean-up.
	_renderCompDomsClean(shadRef);

	if (isShadow) {
		try {
			shadow = shadowParent.attachShadow({mode: components[componentName].mode});
		} catch(err) {
			console.log('Active CSS error in attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err);
		}
	} else {
		shadow = shadowParent;
		shadow.setAttribute('data-active-scoped', '');
		shadow._acssScoped = true;
	}

	// Store the component name in the element itself. We don't need to be able to select with it internally, so it is just a property so we don't clutter the
	// html more than we have to. It is used by the Elements extension for locating related events, which requires the component name, and we have the element at
	// that point so we don't need to search for it.
	shadowParent._acssComponent = componentName;
	shadowParent._acssCompRef = compRef;
	shadowParent._acssPrivEvs = privateEvents;

	shadowDoms[compRef] = shadow;
	// Get the actual DOM, like document or shadow DOM root, that may not actually be shadow now that we have scoped components.
	actualDoms[compRef] = (isShadow) ? shadow : shadow.getRootNode();

	// Attach the shadow.
	shadow.appendChild(template.content);

	shadow.querySelectorAll('[data-activeid]').forEach(function(obj) {
		_replaceTempActiveID(obj);
	});

	// Run a componentOpen custom event, and any other custom event after the shadow is attached with content. This is run on the host object.
	setTimeout(function() {
		// Remove the variable placeholders.
		_removeVarPlaceholders(shadow);

		_handleEvents({ obj: shadowParent, evType: 'componentOpen', compRef: compRef, compDoc: shadow, component: componentName });

		shadow.querySelectorAll('*').forEach(function(obj) {
			if (obj.tagName == 'DATA-ACSS-COMPONENT') {
				// Handle any shadow DOMs now pending within this shadow DOM.
				_renderCompDomsDo(o, obj);
				return;
			}
			// Run draw events on all new elements in this shadow. This needs to occur after componentOpen.
			_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, compRef: compRef, compDoc: shadow, component: componentName });
		});
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
	}
};

const _renderIt = (o, content, childTree, selfTree) => {
	// All render functions end up here.
	// Convert the string into a node tree. Shadow DOMs and scoped components are handled later on. Every render command goes through here, even ones from render
	// events that get drawn in _renderCompDoms. It's potentially recursive. We need to handle the draw event for any non-shadow renders. Using a mutation observer
	// has proven to be over-wieldy due to the recursive nature of rendering events within and outside components, so we'll use a simple analysis to pin-point
	// which new elements have been drawn, and manually set off the draw event for each new element as they get drawn. This way we shouldn't get multiple draw
	// events on the same element.

	let container = document.createElement('div');
	container.innerHTML = content;

	// Make a list of all immediate children via a reference to their Active IDs. After rendering we then iterate the list and run the draw event.
	// We do this to make sure we only run the draw events on the new items.
	// There are positions - it isn't always a straight inner render. And there can be more than one immediate child element.
	let drawArr = [], item, cid;
	container.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);	// Assign the active ID in a temporary state.
		drawArr.push(cid);
	});

	// We need this - there are active IDs in place from the _getActiveID action above, and we need these to set off the correct draw events.
	content = container.innerHTML;

	if (o.renderPos) {
		if (o.renderPos == 'replace') {
			o.secSelObj.insertAdjacentHTML('beforebegin', content);	// Can't replace a node with potentially multiple nodes.
			o.secSelObj.remove();
		} else {
			o.secSelObj.insertAdjacentHTML(o.renderPos, content);
		}
	} else {
		o.secSelObj.innerHTML = content;
	}

	if (drawArr.length == 0) {
		// What was rendered was the inner contents of an element only, so we need to remove var placeholders on the node itself.
		// May as well use the parent of the target selector to ensure we got it. This could be tweaked to be more exact.
		_removeVarPlaceholders(o.secSelObj.parentNode);
	}

	for (item of drawArr) {
		let el = o.doc.querySelector('[data-activeid=' + item + ']');
		_removeVarPlaceholders(el);
		_replaceTempActiveID(el);
		el.querySelectorAll('[data-activeid]').forEach(function(obj) {	// jshint ignore:line
			_replaceTempActiveID(obj);
		});
		if (!el || el.shadow || el.scoped) continue;		// We can skip tags that already have shadow or scoped components.
		_handleEvents({ obj: el, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		el.querySelectorAll('*').forEach(function(obj) {	// jshint ignore:line
			// We can potentially have the same element running a draw event twice. Like the first draw event can add content inside any divs in the first object, which
			// could run this script again. When it finishes that run, it would then come back and run the loop below. And thereby running the draw event twice.
			// So we mark the element as drawn and don't run it twice. It gets marked as drawn in _handleEvents.
			if (obj._acssDrawn || obj.tagName == 'DATA-ACSS-COMPONENT') return;		// Skip pending data-acss-component tags. Note that node may have changed.
			_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		});
	}

	_renderCompDoms(o, undefined, childTree);
};

const _renderRefElements = (str, htmlStr, refType) => {
	// Replace any reference to {$CHILDREN} or {$SELF} with the child nodes of the custom element.
	if (str.indexOf('{$' + refType + '}') !== -1) {
		// This needs to not count escaped references to this variable.
		str = str.replace(new RegExp('\\{\\$' + refType + '\\}', 'g'), htmlStr);
	}
	return str;
};

const _replaceLoopingVars = (str, loopVars) => {
	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-]+)(\}|\.|\[)/gm, function(_, wot, endBit) {
			if (loopVars[wot]) {
				if (loopVars[wot].substr(0, 3) == '-_-') {
					// This is a key of an object. Just return the value itself. No auto-change option for object keys, only values.
					return loopVars[wot].substr(3);
				} else {
					// This matches a variable reference. Substitute with the real variable location reference.
					return '{' + loopVars[wot] + endBit;
				}
			} else {
				// This variable is not in the substitution list.
				return '{' + wot + endBit;
			}
		});
	}
	return str;
};

const _runInnerEvent = (sel, ev, doc=document, initialization=false) => {
	let noDrawTwiceCheck = (ev == 'draw' && initialization);	// If new elements get added during body:init, then it's possible draw events can happen on the same thing twice, hence this line.
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			if (!obj._acssDrawn || !noDrawTwiceCheck) _handleEvents({ obj: obj, evType: ev });
		});
	} else {
		// This is a draw trigger on an element, which should include its contents.
		_handleEvents({ obj: sel, evType: ev });
		_runInnerEvent('*', ev, sel);
	}
};

const _setUpNavAttrs = (el) => {
	let hrf, templ, shortAttr, navEl;
	templ = document.querySelector('#data-active-pages');
	if (templ) {
		shortAttr = el.getAttribute('href');
		if (shortAttr) {
			navEl = templ.querySelector('a[href="' + shortAttr + '"]');
			if (navEl) {
				_cloneAttrs(el, navEl);
			}
		}
	}
};

const _splitIframeEls = (sel, relatedObj=null, compDoc=null) => {
	let targSel, iframeID;
	let root = (relatedObj && typeof relatedObj == 'object') ? _getRootNode(relatedObj) : null;
	let doc = document, hostIsShadow = false, hostIsScoped = false, splitSel = false;
	if (root && !root.isSameNode(document)) {
		// This was called from within a shadow or scoped component object. The doc defaults to the shadowRoot or the scoped host.
		doc = root;
		if (supportsShadow && root instanceof ShadowRoot) {
			hostIsShadow = true;
		} else {
			hostIsScoped = true;
		}
	}
	if (sel.indexOf(' -> ') !== -1) {
		// Handle any doc reference first.
		splitSel = true;
		let ref;
		let refSplit = sel.split(' -> ');
		let co = 0;
		for (ref of refSplit) {
			co++;
			if (co == refSplit.length) break;	// Break before we get to the last one.
			if (ref == 'document') {
				doc = document;
			} else if (ref == 'parent') {
				if (hostIsShadow) {
					root = _getRootNode(root.host);
					doc = root;
				} else if (!hostIsScoped) {
					// The parent is the host is the root in a scoped component, and doc is already set to the root.
				} else if (window.parent.document) {
					// Reference to an iframe host.
					doc = window.parent.document;
				} else {
					console.log('Active CSS error. Reference to a parent element that doesn\'t exist.');
				}
			} else {
				relatedObj = doc.querySelector(ref);
				if (relatedObj.shadowRoot) {
					doc = relatedObj.shadowRoot;
				} else if (relatedObj.tagName == 'IFRAME') {
					doc = relatedObj.contentWindow.document;
					iframeID = ref;
				} else {
					console.log('ref ' + ref + ' is unknown.');
					return false;
				}
			}
		}
		targSel = refSplit[refSplit.length - 1];
	} else {
		targSel = sel;
	}
	if (targSel == 'host') {
		if (!hostIsScoped) {
			root = _getRootNode(root.host);
			doc = root;
		} else {
			doc = _getRootNode(root);
		}
	} else if (compDoc && !splitSel) {
		// Use the default shadow doc. This could be a componentOpen, and unless there's a split selector involved, we need to default to the shadow doc provided.
		doc = compDoc;
	}

	return [doc, targSel, iframeID];
};

const _addConfig = (str, o) => {
	// Concatenate the config files before processing.
	// Before we add the config, we want to add line numbers for debug.
	let configLineArr = str.match(/^.*((\r\n|\n|\r)|$)/gm);
	let newStr = '';
	for (let n = 0; n < configLineArr.length; n++) {
		newStr += '*debugfile:' + o.file + ':' + (n + 1) + '*' + configLineArr[n];
	}
	str = newStr;
	concatConfig += str;
	concatConfigCo++;

	// If this is last file, run the config generator.
	if (concatConfigCo >= concatConfigLen) _readSiteMap();

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
		}
		_handleEvents({ obj: '~_acssSystem', evType: 'afterLoadConfig' });
		_handleEvents({ obj: 'body', evType: 'afterLoadConfig' });
		_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	}
};

const _addConfigError = (str, o) => {
	// Needs an error handling.
	_handleEvents({ obj: o.obj, evType: 'loadconfigerror' });
};

const _assignLoopToConfig = (configObj, nam, val, file, line, intID, componentName, ev) => {
	let secsels, secselsLength, secsel, i, thisAct, secSelCounter = -1;
	if (['@each'].indexOf(nam.substr(0, 5)) !== -1) {
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
	let compDoc = (e.target instanceof ShadowRoot) ? e.target : null;
	let compRef = e.target._acssCompRef;
	if (!setupEnded) return;	// Wait for the config to fully load before any events start.
	let fsDet = _fullscreenDetails();
	switch (ev) {
		case 'click':
			if (!e.ctrlKey && !e.metaKey) {	// Allow default behaviour if control/meta key is used.
				_mainEventLoop('click', e, component, compDoc, compRef);
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
				case ':': funcKey = 'Colon'; shiftCheck = ''; break;
				case ';': funcKey = 'Semicolon'; shiftCheck = ''; break;
				case '{': funcKey = 'OpenCurly'; shiftCheck = ''; break;
				case '}': funcKey = 'CloseCurly'; shiftCheck = ''; break;
				case '"': funcKey = 'DoubleQuotes'; shiftCheck = ''; break;
				case "'": funcKey = 'SingleQuote'; shiftCheck = ''; break;
				case '?': funcKey = 'Question'; shiftCheck = ''; break;
				case '!': funcKey = 'Exclamation'; shiftCheck = ''; break;
			}
			_mainEventLoop(ev + metaCheck + ctrlCheck + shiftCheck + funcKey, e, component, compDoc, compRef);
			_mainEventLoop(ev, e, component, compDoc, compRef);
			break;

		case fsDet[1] + 'fullscreenchange':
			_mainEventLoop(ev, e, component, compDoc, compRef);
			if (fsDet[0]) {
				_mainEventLoop('fullscreenEnter', e, component, compDoc, compRef);
			} else {
				_mainEventLoop('fullscreenExit', e, component, compDoc, compRef);
			}
			break;

		default:
			_mainEventLoop(ev, e, component, compDoc, compRef);
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
const _convConfig = (cssString, totOpenCurlies, co=0) => {
	// Note: By this point in initialisation the config should be compatible for parsing in a similar fashion to CSS.
	let node = {}, match = null, count = 0, bits, sel, name, value, obj, newNode, commSplit;
	while ((match = PARSEREGEX.exec(cssString)) !== null) {
		if (co > totOpenCurlies) {
			// Infinite loop checker.
			// If the count goes above the total number of open curlies, we know we have a syntax error of an unclosed curly bracket.
			console.log('Syntax error in config - possibly an incomplete set of curly brackets.');
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
			newNode = _convConfig(cssString, totOpenCurlies, co);
			if (newNode === false) return false;	// There's been a syntax error.
			obj = {};
			obj.name = _sortOutEscapeChars(name);
			obj.value = newNode;
			obj.line = configLine;
			obj.file = configFile;
			obj.intID = intIDCounter++;
			obj.type = 'rule';
			node[count++] = obj;
		} else if (match[PARSEEND]) { return node;	// Found closing brace
		} else if (match[PARSEATTR]) {
			// Handle attributes.
			// Remove any comments lurking.
			var line = match[PARSEATTR].trim();
			line = line.replace(/\*debugfile[\s\S]*?\*|([^:]|^)\/\/.*$/g, '');
			var attr = PARSELINEX.exec(line);
			if (attr) {
				// Attribute
				name = attr[1].trim();
				value = attr[2].trim();
				obj = {};
				obj.name = _sortOutEscapeChars(name);
				obj.value = _sortOutEscapeChars(value);
				obj.type = 'attr';
				obj.line = configLine;
				obj.file = configFile;
				obj.intID = intIDCounter++;
				node[count++] = obj;
			} else {
				node[count++] = line;
			}
		}
	}
	return node;
};

ActiveCSS._getPosOfRule = (list, item) => {
	return _getValFromList(list, item, true);
};

const _initScriptTrack = () => {
	document.querySelectorAll('script').forEach(function (obj, index) { scriptTrack.push(obj.src); });
};

const _iterateConditionals = (conditions, rules, sel) => {
	var counter, ruleName, ruleValue;
	Object.keys(rules).forEach(function(key) {
		ruleName = rules[key].name;
		if (!ruleName) return;
		counter = conditions[sel].length;
		conditions[sel][counter] = {};
		conditions[sel][counter].name = ruleName;
		conditions[sel][counter].value = rules[key].value;
		conditions[sel][counter].file = rules[key].file;
		conditions[sel][counter].line = rules[key].line;
		conditions[sel][counter].intID = rules[key].intID;
	});
	return conditions;
};

const _iteratePageList = pages => {
	if (!('content' in document.createElement('template'))) {
		console.log('Browser does not support html5. Cannot instantiate page navigation.');
		return;
	}
	let templ = document.createElement('template');
	templ.id = 'data-active-pages';
	var counter, page, attrs, el;
	let rand = Math.floor(Math.random() * 10000000);
	Object.keys(pages).forEach(function(key) {
		page = pages[key].name;
		if (!page) return;
		if (pageList.indexOf(page) !== -1) {
			console.log('Config error: Page ' + page + ' is referenced twice.');
		}
		attrs = pages[key].value.replace(/\{\$RAND\}/g, rand);
		templ.insertAdjacentHTML('beforeend', '<a href=' + page.trim() + ' ' + attrs.trim() + '>');
	});
	document.body.appendChild(templ);
};

const _iterateRules = (compConfig, rules, sel, ev, condition, componentName=null) => {
	let thisAct, ruleName, ruleValue, page, pageTitle, secsels, secselsLength, secsel, i, nam, val;
	let secSelCounter = -1;
	Object.keys(rules).forEach(function(key2) {
		nam = rules[key2].name;
		val = rules[key2].value;
		if (!nam) return;
		// Look for and handle any @each loop around potentially multiple secondary selectors.
		if (['@each'].indexOf(nam.substr(0, 5)) !== -1) {
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

const _makeVirtualConfig = (subConfig='', mqlName='', componentName=null, eachLoop=null) => {
	// Loop through the config, splitting up multi selectors and giving them their own entry. Put this into the config.
	var pConfig = (subConfig !== '') ? subConfig : parsedConfig;
	var str, strLength, i, strTrimmed, strTrimCheck, isComponent;
	var selectorName, evSplit, ev, sel, isConditional;
	Object.keys(pConfig).forEach(function(key) {
		if (!pConfig[key].name) return;
		selectorName = pConfig[key].name;
		isConditional = false;
		// Split by comma, but not any that are in parentheses, as those are in selector functions.
		str = selectorName.split(/,(?![^\(\[]*[\]\)])/);
		strLength = str.length;
		for (i = 0; i < strLength; i++) {
			strTrimmed = str[i].trim();
			// This could be a component that has an event, so we force the below to skip recognising this as a component.
			isComponent = (strTrimmed.substr(0, 11) == '@component ');
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
					conditionals[condName] = (conditionals[condName] === undefined) ? [] : conditionals[condName];
					conditionals = _iterateConditionals(conditionals, pConfig[key].value, condName);
					isConditional = true;
					break;

				case '@':
					if (strTrimmed == '@pages') {
						// This is a page list declaration. Append it to any others previously found.
						_iteratePageList(pConfig[key].value);
					} else if (isComponent) {
						// This is an html component. Stored like the conditional but in a different place.
						let compName = strTrimmed.split(' ')[1].trim();
						if (!components[compName]) components[compName] = {};
						components[compName].mode = null;
						components[compName].shadow = false;
						components[compName].scoped = false;
//						components[compName].scoped = true;		// All components are scoped by default now.
						components[compName].privEvs = false;
						let checkStr = strTrimmed + ' ';
						// Does this have shadow DOM creation instructions? ie. shadow open or shadow closed. Default to open.
						if (checkStr.indexOf(' shadow ') !== -1) {
							components[compName].shadow = true;
							components[compName].mode = (strTrimmed.indexOf(' closed') !== -1) ? 'closed' : 'open';
						}
						if (checkStr.indexOf(' private ') !== -1 || checkStr.indexOf(' privateVariables ') !== -1) {	// "private" is deprecated as of v2.4.0
							components[compName].privVars = true;
							// Private variable areas are always scoped, as they need their own area.
							// We get a performance hit with scoped areas, so we try and limit this to where needed.
							// The only other place we have an area scoped is where events are within components. Shadow DOM is similar but has its own handling.
							components[compName].scoped = true;
						}
						if (checkStr.indexOf(' privateEvents ') !== -1) {
							components[compName].privEvs = true;
						}
						// Recurse and set up componentness.
						_makeVirtualConfig(pConfig[key].value, '', compName);
						// Handle no html content.
						if (components[compName].data === undefined) {
							components[compName].data = '';
							components[compName].file = '';
							components[compName].line = '';
							components[compName].intID = '';
						}
						// Reset the component name, otherwise this will get attached to all the remaining events.
						compName = '';
					} else {
						// This is a media query. Set it up and call the config routine again so the internal media query name can be attached to the events.
						mqlName = _setupMediaQueryHandler(strTrimmed.slice(7).trim());
						// Recurse and set up a conditional node.
						_makeVirtualConfig(pConfig[key].value, mqlName);
						// Reset the media query name, otherwise this will get attached to all the remaining events.
						mqlName = '';
					}
					break;

				default:
					if (strTrimmed == 'html') {
						if (componentName) {
							// This is component html.
							components[componentName].data = pConfig[key].value[0].value.slice(1, -1);	// remove outer quotes;
							components[componentName].data = components[componentName].data.replace(/\\\"/g, '"');
							components[componentName].file = pConfig[key].value[0].file;
							components[componentName].line = pConfig[key].value[0].line;
							components[componentName].intID = pConfig[key].value[0].intID;
						}
					} else {
						// This is an event.
						// Could be colons in selector functions which we need to ignore in the split.
						evSplit = strTrimmed.split(/:(?![^\(\[]*[\]\)])/);
						// The first item in the array will always be the main selector, and the last will always be the event.
						// The middle can be a mixture of conditions.
						if (!evSplit[1]) {	// This has no split selector entry and is an error.
							console.log('"' + selectorName + '" ' + strTrimmed + ' is not a fully formed selector - it may be missing an event or have incorrect syntax. Or you have too many closing curly brackets.');
							continue;
						}
						sel = evSplit.shift();	// Get the main selector (get the beginning clause and remove from array)

						ev = evSplit.pop();	// Get the event (get the last clause and remove from array)
						ev = ev.trim();

						let predefs = [], conds = [];
						if (evSplit) {	// Only run this if there is anything left in the clause array.
							// Loop the remaining selectors, pop out each one and assign to the correct place in the config.
							// Ie. either after the selector for DOM queries, or as part of the conditional array that gets
							// attached to the event.
							let re, clause;
							for (clause of evSplit) {
								re = new RegExp(COLONSELS, 'g');
								if (re.test(clause)) {
									predefs.push(clause);
								} else {
									conds.push(clause);
								}
							}
						}
						// Does this need a media query conditional adding?
						if (mqlName !== '') {
							conds.push(mqlName);
						}
						if (predefs.length > 0) {
							sel += ':' + predefs.join(':');	// Put the valid DOM selector clauses back.
						}
						// Set up the event in the config.
						// If this is an event for a component, it gets a special handling compared to the main document. It gets a component prefix.
						if (componentName) {
							sel = '|' + componentName + ':' + sel;
							shadowSels[componentName] = (shadowSels[componentName] === undefined) ? [] : shadowSels[componentName];
							shadowSels[componentName][ev] = true;	// We only want to know if there is one event type per shadow.
							// Targeted events get set up only when a shadow is drawn, as they are attached to the shadow, not the document. No events to set up now.
							// All non-shadow components are now scoped so that events can occur in any component, if there are any events.
							components[componentName].scoped = true;
						}
						config[sel] = (config[sel] === undefined) ? {} : config[sel];
						config[sel][ev] = (config[sel][ev] === undefined) ? {} : config[sel][ev];

						let conditionName;
						if (conds.length === 0) {
							conditionName = 0;
						} else {
							// Concat the conditions with a space.
							conditionName = conds.join(' ');
						}
						preSetupEvents.push({ ev, sel });
						if (config[sel] === undefined) {	// needed for DevTools.
							config[sel] = {};
						}
						if (config[sel][ev] === undefined) {	// needed for DevTools.
							config[sel][ev] = {};
						}
						if (config[sel][ev][conditionName] === undefined) {
							config[sel][ev][conditionName] = [];
						}
						config[sel][ev][conditionName].push(_iterateRules([], pConfig[key].value, sel, ev, conditionName, componentName));
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

ActiveCSS._mapRegexReturn = (mapObj, str, mapObj2=null) => {
	if (typeof str !== 'string') return str;	// If it's not a string, we don't have to replace anything. Here for speed.
	let reg = new RegExp(Object.keys(mapObj).join('|'), 'gim');
	str = str.replace(reg, function(matched){
		if (!mapObj2) {
			return mapObj[matched];
		} else {
			// Match with a second object, not the regex object.
			return mapObj2[matched];
		}
	});
	return str;
};

const _parseConfig = str => {
	// Keep the parsing regex for the config arrays as simple as practical.
	// The purpose of this script is to escape characters that may get in the way of evaluating the config sanely during _makeVirtualConfig.
	// There may be edge cases that cause this to fail, if so let us know, but it's usually pretty solid for practical use.
	// External debugging tools can be set up for line syntax checking - keep the engine at optimum speed.
	// If someone wants to thrash test it, please let support know of any exceptional cases that should pass but don't.
	// There are quite possibly unnecessary bits in the regexes. If anyone wants to rewrite any so they are more accurate, that is welcome.
	// This sequence, and the placing into the config array after this, is why the core is so quick, even on large configs. Do not do manually looping on
	// the main config. If you can't work out a regex for a new feature, let the main developers know and they'll sort it out.
	// Remove all comments.
	str = str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
	// Remove line-breaks, etc., so we remove any multi-line weirdness in parsing.
	str = str.replace(/[\r\n\t]+/g, '');
	// Replace escaped quotes with something else for now, as they are going to complicate things.
	str = str.replace(/\\\"/g, '_ACSS_escaped_quote');
	// Convert @command into a friendly-to-parse body:init event. Otherwise it gets unnecessarily messy to handle later on due to being JS and not CSS.
	str = str.replace(/\\\"/g, '_ACSS_escaped_quote');
	let systemInitConfig = '';
	str = str.replace(/@command[\s]+(conditional[\s]+)?([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-]+[\s]*\{\=[\s\S]*?\=\})/g, function(_, typ, innards) {
		// Take these out of whereever they are and put them at the bottom of the config after this action. If typ is undefined it's not a conditional.
		systemInitConfig += '~_acssSystem:' + ((!setupEnded) ? 'init' : 'afterLoadConfig') + '{' + (!typ ? 'create-command' : 'create-conditional') + ':' + innards + ';}';
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
	str = str.replace(/<style>([\s\S]*?)<\/style>/gim, function(_, innards) {
		return '<style>' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '</style>';
	});
	// Replace variable substitutations, ie. {$myVariableName}, etc.
	str = str.replace(/\{\$([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_dollar_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\[\]]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\#\:]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_brace_start_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\#\:]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_pipe_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_hash_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\$\[\]]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	// Sort out component escaping.
	// First, replace all escaped curlies with something else.
	str = str.replace(/\\{/g, '_ACSS_brace_start');
	str = str.replace(/\\}/g, '_ACSS_brace_end');
	// Now we can match the component accurately. The regex below should match all components.
	str = str.replace(/([^\u00BF-\u1FFF\u2C00-\uD7FF\w_\-]html[\u00BF-\u1FFF\u2C00-\uD7FF\w_\- ]+{)([\s\S]*?)}/gi, function(_, startBit, innards) {
		// Replace existing escaped quote placeholder with literally escaped quotes.
		innards = innards.replace(/_ACSS_escaped_quote/g, '\\"');
		// Now escape all the quotes - we want them all escaped, and they wouldn't have been picked up before.
		innards = innards.replace(/"/g, '_ACSS_escaped_quote');
		// Now format the contents of the component so that it will be found when we do a css-type object creation later.
		return startBit + '{component: "' + innards + '";}';
	});
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
	str = _convConfig(str, totOpenCurlies);
	if (!str['0']) {
		console.log('Active CSS: Either your config is empty or there is a structural syntax error.');
	}
	return str;
};

const _readSiteMap = () => {
	// We have the config file loaded. Go through the config file and sort out the website objects and properties.
	// This is an SPA so we do everything first in a speedy fashion - we only do this once.
	// Don't forget that load-config runs this too, so anything for first initialization needs to be with the !setupEnded condition.
	parsedConfig = _parseConfig(concatConfig);
	concatConfig = '';	// We may need to add to this config later, so keep it in memory.

	var debugConfig = (debugMode) ? _doDebug('parser') : false;
	if (debugConfig) console.log(parsedConfig);

	if (!setupEnded) {
		// We are going to automatically set up which events can be declared as passive events, and we need to know if the browser supports passive events (doesPassive).
		_setupPassive();
	}

	// Make a new virtual config, which has split up selectors. We do this so we can do quick finding of event handlers and not have to iterate anything.
	_makeVirtualConfig();

	// Set up events. We can only do this after the config is fully loaded, as there could be multiple events of the same type and we need to know if they are
	// passive or not (if they use prevent-default or not).
	let evSet;
	for (evSet of preSetupEvents) {
		_setupEvent(evSet.ev, evSet.sel);
	}
	// Clean up. If we run load-config, we'll run this function again and only attempt to add the new events loaded.
	preSetupEvents = [];

	if (!setupEnded) {
		_startMainListen();

		// Put all the existing script tag details into memory so we don't load things up twice if load-script is used.
		_initScriptTrack();

		// DOM cleanup observer. Note that this also picks up shadow DOM elements. Initialise it before any config events.
		elementObserver = new MutationObserver(ActiveCSS._nodeMutations);
		elementObserver.observe(document.body, {
			childList: true,
			subtree: true
		});

		// Set up any custom action commands or conditionals. These can be run everywhere - they are not isolated to components.
		_handleEvents({ obj: '~_acssSystem', evType: 'init' });

		// Handle any developer initialization events
		_handleEvents({ obj: 'body', evType: 'preInit' });

		_handleEvents({ obj: 'body', evType: 'init' });

		// Iterate items on this page and do any draw events.
		_runInnerEvent('*', 'draw', document, true);

		_handleEvents({ obj: 'body', evType: 'scroll' });	// Handle any immediate scroll actions on the body if any present. Necessary when refreshing a page.

		_wrapUpStart();

		// Lazy load config.
		if (lazyConfig !== '') {
			setTimeout(function() {
				let arr = lazyConfig.split(','), configFile;
				for (configFile of arr) {
					_a.LoadConfig({ actName: 'load-config', actVal: configFile, doc: document});	// load-config param updates the panel.
				}
			}, 1000);
		}
	}
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

	str = str.trim();
	if (mediaQueriesOrig[str]) return mediaQueriesOrig[str];	// Return the name of the already existing media query.
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
	conditionals[mqlName].push({ 'name': 'mql-true', 'value': mqlName });
	// Set up the variable which stores the event listener and state of the resulting media query.
	let ev = window.matchMedia(str);
	let matches = ev.matches;
	mediaQueries.push(mqlName);
	mediaQueries[mqlName] = { 'ev': ev, 'val': matches };
	// Set initial value.
	// Set up the event listener and function.
	mediaQueries[mqlName].ev.addListener(function(e) {
		// When the media query state changes, set the internal pointer to true or false.
		let mqlName = mediaQueriesOrig[e.media];
		mediaQueries[mqlName].val = e.matches;
	});
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
	if (!document.parentNode) {
		window.addEventListener('popstate', function(e) {
			let page = e.state, obj;
			if (!page) return;	// could be a hash link.
			if (debuggerActive) {
				_debugOutput('Popstate event');
			}
			let templ = document.querySelector('#data-active-pages');
			let ok = false;
			if (page && templ) {
				let full = new URL(page);
				let shortAttr = full.pathname + full.search;
				let navEl = templ.querySelector('a[href="' + shortAttr + '"]');
				if (navEl) {
					ActiveCSS.trigger(navEl, 'click');
					ok = true;
				}
			}
			if (!ok) window.location.href = page;		// Not found - redirect.
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

	// Set up listening for changes to scoped variables.
	scopedVars = _observableSlim.create(scoped, true, ActiveCSS._varUpdateDom);

};

const _wrapUpStart = () => {
	// The page has been reloaded. Every page in Active CSS must have an element that contains an href linking to it, which when clicked on will perform the
	// actions necessary to redraw the page. The page has just been loaded or reloaded, so there was no object clicked on to perform any actions yet.
	// So we need to find the href in the page that has the url, and based on that, we assume that clicking on this object will perform the correct actions
	// to redraw the page when necessary.
	let url = _resolveURL(window.location.href);
	window.history.replaceState(url, document.title, url);
	setupEnded = true;
	document.dispatchEvent(new CustomEvent('ActiveCSSInitialized', {}));
};

ActiveCSS.init = (config) => {
	config = config || {};
	passiveEvents = (config.passiveEvents === undefined) ? true : config.passiveEvents;
	inlineConfigTags = document.querySelectorAll('style[type="text/acss"]');
	if (autoStartInit) {
		if (inlineConfigTags) {
			// This only runs if there is no user config later in the page within the same call stack. If the Active CSS initialization is timed out until later on,
			// then obviously the initialization events will not run.
			lazyConfig = '';
			_initGetInline();	// function is at the bottom of this script.
		}
		autoStartInit = false;
	} else {
		userSetupStarted = true;
		if (setupEnded) {
			console.log('Cannot initialize Active CSS twice.');
			return;
		}
		lazyConfig = config.lazyConfig || '';
		config.configLocation = config.configLocation || console.log('No inline or Active CSS config file setup - see installation docs.');
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
		if (inlineConfigTags) _initGetInline();	// function is at the bottom of this script.
		for (thisFile of configArrTmp) {
			thisFile = thisFile.trim();
			configArr.push(_getBaseURL(thisFile));	// Build up the initial config list without anything after and including the "?".
			_getFile(thisFile, 'txt', { file: thisFile });
		}
	}
};

const _initGetInline = () => {
	// Initial inline style type="text/acss" detection prior to any user config.
	concatConfigLen += inlineConfigTags.length;
	inlineConfigTags.forEach(acssTag => {
		_addConfig(acssTag.innerHTML, { file: 'inline' });
	});
	inlineConfigTags = null;
};

// Store the rendered location of the attribute for quick DOM lookup when state changes. It doesn't have wrapping comments so it needs an extra reference location.
// This doesn't do a set-attribute. This is done before the attribute is set.
const _addScopedAttr = (wot, o, originalStr, walker, scopeRef) => {
	let cid = _addScopedCID(wot, o.secSelObj, scopeRef);
	let attrName = o.actVal.split(' ')[0];
	let str = (!walker) ? originalStr.substr(originalStr.indexOf(' ') + 1)._ACSSRepQuo() : originalStr;
	_set(scopedData, wot + '.attrs[' + cid + '][' + attrName + ']', { orig: str, scopeRef });
};

// Store the rendered location for quick DOM lookup when state changes. We need this for both content and attribute rendering.
const _addScopedCID = (wot, obj, scopeRef) => {
	let cid = _getActiveID(obj);
	_set(scopedData, wot + '.cids[' + cid + ']', { cid, scopeRef } );
	return cid;
};

const _escapeItem = (str, func) => {
	if (['Render', 'RenderAfterBegin', 'RenderAfterEnd', 'RenderBeforeBegin', 'RenderBeforeEnd', 'SetAttribute'].indexOf(func) === -1) return str;
	// This is for putting content directly into html.
	let div = document.createElement('div');
	div.textContent = str.replace(/\{\=|\=\}/gm, '');
	// Remove possibility of JavaScript evaluation later on in a random place.
	return div.innerHTML;
};

const _getObjFromDots = (obj, i) => {
	if (obj[i] === undefined) {	// could be empty, which is fine.
		// Display sane error for debugging. Not sure what level of debug this should go in, so leave it for now.
		// Var may not be there though, which could be totally valid.
		return '';
	}
	return obj[i];
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

const _prefixScopedVars = function(str, compRef=null) {
	/**
	 * "str" is a string that could contain scoped variables that need proper set up before evaluating.
	 * It finds each word, which may include a period (.), and see if this needs scoping. It may already have a scoped prefix. If it doesn't, it gets
	 * a scoped prefix added. At the end it will return the formatted string. It will only add the "scopedVars." prefix if the word exists in the string.
	 * We need to ignore all words in double quotes, so the part of the regex referencing quotes brings back a full string including quotes so we can ignore the
	 * whole thing.
	*/
	let mapObj = {}, mapObj2 = {}, scopedVar, varEval;

	str = str.replace(/(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)(\\"|"(?:\\"|[^"])*"|[\u00BF-\u1FFF\u2C00-\uD7FF\w_\.]+)(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)/gim, function(_, wot) {
		if (wot.indexOf('"') !== -1 || wot.match(/^[\d]+$/)) return wot;	// This is a full quoted so is an invalid match - ignore it.
		if (wot == 'true' || wot == 'false') return wot;
		if (wot.indexOf('.') !== -1) {
			// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
			// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
			let firstVar = wot.split('.')[0];
			// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use scopedVars, but just in case ignore that too.
			if (firstVar == 'window' || firstVar == 'scopedVars') return wot;
		}
		scopedVar = ((compRef && privVarScopes[compRef]) ? compRef : 'main') + '.' + wot;
		varEval = _get(scopedVars, scopedVar);
		// Only return the variable if it actually exists.
		return (varEval) ? 'scopedVars.' + scopedVar : wot;
	});
	return str;
};

const _removeVarPlaceholders = obj => {
	/**
	* Handle text nodes.
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
	* Handle style tags.
	*/
	// We'll be storing reactive variable references to the style tag (varStyleMap) + the reference to the original contents of the style tag (varInStyleMap).
	treeWalker = document.createTreeWalker(
		obj,
		NodeFilter.SHOW_ELEMENT
	);
	let str, el;
	while (treeWalker.nextNode()) {
		if (treeWalker.currentNode.tagName != 'STYLE') continue;
		el = treeWalker.currentNode;
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
				let val = _get(scopedVars, wot);
				return (val) ? val : '';
			}
			return wot2 || '';
		});
		el.textContent = str;	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
	}

};

// Replace attributes if they exist. Also the {$RAND}, as that is safe to run in advance. This is run at multiple stages at different parts of the runtime
// config on different objects as they are needed. Also replace JavaScript expressions {= expression}.
const _replaceAttrs = (obj, sel, secSelObj=null, o=null, func='', compRef=null) => {
	// Note, obj could sometimes be a string with no attributes if this is a trigger.
	// For this to be totally safe, we escape the contents of the attribute before inserting.
	if (!sel) return '';
	if (sel.indexOf('{$RAND}') !== -1) {
		let rand = Math.floor(Math.random() * 10000000);
		sel = sel.replace(/\{\$RAND\}/g, rand);
	}
	if (sel.indexOf('{=') !== -1 && !(o && ['CreateCommand', 'CreateConditional', 'Eval', 'Run'].includes(o.func))) {	// skip restoration and eval now if it needs to run dynamically.
		sel = ActiveCSS._sortOutFlowEscapeChars(sel);
		sel = _replaceJSExpression(sel, null, null, compRef);
	}
	if (sel.indexOf('{@') !== -1) {
		sel = sel.replace(/\{\@([^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let wotArr = wot.split('.'), ret, err = [];
			if (wotArr[1] && wotArr[0] == 'selected' && obj.tagName == 'SELECT') {
				// If selected is used, like [selected.value], then it gets the attribute of the selected option, rather than the select tag itself.
				ret = obj.options[obj.selectedIndex].getAttribute(wotArr[1]);
				if (ret) return _escapeItem(ret);
				ret = obj.options[obj.selectedIndex][wotArr[1]];
				if (ret) return _escapeItem(ret);
				err.push('Neither attribute or property ' + wotArr[1] + ' found in target or primary selector:');
			} else {
				let colon = wot.lastIndexOf(':');	// Get the last colon - there could be colons in the selector itself.
				if (colon !== -1) {
					// This should be an id followed by an attribute, or innerText, or it's a shadow DOM host attribute.
					let elRef = wot.substr(0, colon), el;
					if (elRef == 'host' && (!o || ['beforeComponentOpen', 'componentOpen'].indexOf(o.event) === -1)) {
						if (!obj.shadowRoot) return '{@' + wot + '}';	// Need to leave this alone. We can't handle this yet. This can be handled in scopedVars.
						el = obj.shadowRoot;
					} else {
						el = _getSel(o, elRef);
					}
					let wat = wot.substr(colon + 1);
					if (el.tagName == 'IFRAME' && wat == 'url') {
						// If this is an iframe and the virtual attribute url is chosen, get the actual url inside the iframe.
						// We can't rely on the src of the iframe element being accurate, as it is not always updated.
						return _escapeItem(el.contentWindow.location.href);
					} else {
						ret = el.getAttribute(wat);
						if (ret) return _escapeItem(ret);
						ret = el[wat];
						if (ret) return _escapeItem(ret);
						err.push('Neither attribute or property ' + wat + ' found in target or primary selector:');
					}
				} else {
					if (obj && typeof obj !== 'string') {
						if (secSelObj) {
							// Check the target selector first.
							ret = secSelObj.getAttribute(wot);
							if (ret) return _escapeItem(ret);
							ret = secSelObj[wot];
							if (ret) return _escapeItem(ret);
						}
						// Check the primary selector next.
						ret = obj.getAttribute(wot);
						if (ret) return _escapeItem(ret);
						ret = obj[wot];
						if (ret) return _escapeItem(ret);
						err.push('Attribute not property ' + wot + ' found in target or primary selector:');
					}
				}
			}
			if (err) err.push(obj);
			return '';	// More useful to return an empty string. '{@' + wot + '>';
		});
	}
	sel = _replaceStringVars(o, sel, compRef);
	// Replace regular scoped variables with their content, and if content-based put internal wrappers around the bound variables so they can be formatted later.
	// We can only do this after attributes have been substituted, in order to handle variable binding in an attribute that also has an attribute substituted.
	return _replaceScopedVars(sel, secSelObj, func, o, null, null, compRef);
};

const _replaceComponents = (o, str) => {
	// This needs to be recursive to facilitate easier syntax. XSS defense needs to occur elsewhere otherwise this ceases to be useful. This must stay recursive.
	let co = 0, found;
	while (co < 50) {
		found = false;
		co++;

		// Handle ID tag content insertion first.
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-_]+)\}/gi, function(_, c) {	// jshint ignore:line
			let el = document.getElementById(c);
			if (el) return el.innerHTML;
			// Return it as it is if the element is not there.
			return '{#' + c + '}';
		});

		// Now handle real component insertion.
		// See create-element code for why this is used: "_acss-host_' + tag + '_"
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-_]+)\}/gi, function(_, c) {	// jshint ignore:line
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
			// Handle any looping variable replacement in the component.
			ret = (o.loopRef != '0') ? _replaceLoopingVars(ret, o.loopVars) : ret;
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
				ret = _replaceAttrs(o.obj, ret, null, null, o.func, o.compRef);
				ret = _replaceStringVars(o.ajaxObj, ret);
			}
			return (ret) ? ret : '';
		});
		if (!found) break;
	}
	if (co == 50) console.log('Active CSS recursion detected during component rendering. Skipped after 50 attempts.\nFile: ' + o.file + ', line: ' + o.line);
	return str;
};

const _replaceJSExpression = (sel, realVal=false, quoteIfString=false, compRef=null) => {
	let res;
	sel = sel.replace(/\{\=([\s\S]*?)\=\}/gm, function(str, wot) {
		// Evaluate the JavaScript expression.
		// See if any unscoped variables need replacing.
		wot = _replaceScopedVarsExpr(wot, compRef);
		
		try {
			res = Function('scopedVars', '"use strict";return (' + wot + ');')(scopedVars);		// jshint ignore:line
		} catch (err) {
			console.log('JavaScript expression error (' + err + '): ' + sel);
			console.log('Actual expression evaluated: ' + wot);
		}
		if (!realVal) {		// If realVal is set to true, we want to return the actual expression result in this case, so do nothing here.
			// Res should always be a string in the config, even if evaluated into a conditional. This is because the config is made up of strings.
			let q = '';
			if (quoteIfString) {
				q = '"';
			}
			res = (res === true) ? 'true' : (res === false) ? 'false' : (typeof res === 'string') ? q + res + q : (typeof res === 'number') ? res.toString() : 'Invalid expression (' + wot.trim() + ')';
		}
		return res;
	});
	// Return the result rather than the string if realVal is set to true.
	return (realVal) ? res : sel;
};

const _replaceScopedVars = (str, obj=null, func='', o=null, fromUpdate=false, shadHost=null, compRef=null) => {
	// Evaluate and insert scoped variables. This could be a HTML string containing nodes.
	// This should only happen after attribute substitution has occurred, otherwise binding in attributes won't work fully.
	// Eg.: set-attribute: data-name "{{firstName}} {@id}{{surname}} {{surname}}". Simply put, the ID is not easily obtainable when updating the attribute with
	// a bound variable. If this becomes a problem later, we would have to store the expand this to reference the location of the attribute via the active ID. But
	// it is fine as it is at this point in development.
	// This function is also called when an variable change triggers an attribute update.
	let fragment, fragRoot, treeWalker, owner, txt, cid, thisHost, actualHost, el, attrs, attr;
	// Convert string into DOM tree. Walk DOM and set up active IDs, search for vars to replace, etc. Then convert back to string. Hopefully this will be quick.
	// Handle inner text first.
	if (str.indexOf('{{') !== -1 && !fromUpdate && str.indexOf('</') !== -1) {
		fragRoot = document.createElement('template');
		fragRoot.innerHTML = str;

		// First label any custom elements that do not have inner components, as these need to act as hosts, so we need to pass this host when replacing attributes.
		treeWalker = document.createTreeWalker(
			fragRoot.content,
			NodeFilter.SHOW_ELEMENT
		);
		while (treeWalker.nextNode()) {
			if (customTags.includes(treeWalker.currentNode.tagName)) {
				// Scope all custom tags by default. This happens anyway for all components. It's needed here to set a reference for host attribute variables.
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
				let newAttr = _replaceScopedVarsDo(attr.nodeValue, null, 'SetAttribute', { secSelObj: el, actVal: attr.nodeName + ' ' + attr.nodeValue }, true, actualHost, compRef);
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
			el.textContent = _replaceScopedVarsDo(txt, owner, 'Render', null, true, actualHost, compRef);
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
		str = _replaceScopedVarsDo(str, obj, func, o, false, shadHost, compRef);
	}
	return str;
};

const _replaceScopedVarsDo = (str, obj=null, func='', o=null, walker=false, shadHost=null, compRef=null) => {
	let res, cid, isBound = false, isAttribute = false, isHost = false, originalStr = str;
	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{((\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\:\[\]]+(\})?)\}/gm, function(_, wot) {
			let realWot;
			if (wot[0] == '{') {		// wot is a string. Double curly in pre-regex string signifies a variable that is bound to be bound.
				isBound = true;
				// Remove the outer parentheses now that we know this needs binding.
				wot = wot.slice(1,-1);
			}
			if (wot[0] == '@') {
				// This is an attribute not handled earlier. It's hopefully a shadow DOM host attribute as regular bound attribute vars are not yet supported.
				if (!shadHost) return _;	// Shouldn't handle this yet. Only handle it when called from _renderCompDoms.
				isAttribute = true;
				wot = wot.slice(1);
				let hostColon = 'host:';
				if (wot.indexOf(hostColon) !== -1) {
					isHost = true;
					wot = wot.replace(hostColon, '');
					if (shadHost.hasAttribute(wot)) {
						res = _escapeItem(shadHost.getAttribute(wot), func);
						let hostCID = _getActiveID(shadHost).replace('d-', '');
						realWot = hostCID + 'HOST' + wot;	// Store the host active ID so we know that it needs updating inside a shadow DOM host.
					} else {
						console.log('Component host attribute ' + wot + ' not found. Looking in host element: ', shadHost);
						return _;
					}
				} else {
					console.log('Non component attribution substitution is not yet supported.');
					return _;
				}
			} else {
				// Convert to dot format to make things simpler in the core - it is faster to update if there is only one type of var to look for.
				wot = wot.replace(/\[/, '.');
				wot = wot.replace(/\]/, '');
				// Evaluate the JavaScript expression.
				if (wot.indexOf('.') !== -1) {
					// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
					// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
					let firstVar = wot.split('.')[0];
					// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use "scopedVars", but do a handling for that anyway.
					if (firstVar == 'window') return wot;
					if (firstVar == 'scopedVars') {
						wot = wot.replace(/^scopedVars\./, '');
					}
				}
				// Prefix with sub-scope (main or _CompRef).
				wot = (compRef && privVarScopes[compRef]) ? compRef + '.' + wot : 'main.' + wot;
				res = _get(scopedVars, wot);
				// Return an empty string if undefined.
				res = (res === true) ? 'true' : (res === false) ? 'false' : (typeof res === 'string') ? _escapeItem(res, func) : (typeof res === 'number') ? res.toString() : (res && typeof res === 'object') ? '__object' : '';	// remember typeof null is an "object".
				realWot = wot;
			}
			if (isBound && func.indexOf('Render') !== -1) {
				// We only need comment nodes in content output via render - ie. visible stuff. Any other substitution is dynamically rendered from
				// original, untouched config.
				_addScopedCID(realWot, obj, compRef);
				let retLT, retGT;
				if (obj.tagName == 'STYLE') {
					retLT = (walker) ? '_cj_s_lts_' : '/*';
					retGT = (walker) ? '_cj_s_gts_' : '*/';
				} else {
					retLT = (walker) ? '_cj_s_lt_' : '<!--';
					retGT = (walker) ? '_cj_s_gt_' : '-->';
				}
				return retLT + 'active-var-' + realWot + retGT + res + retLT + '/active-var' + retGT;
			} else {
				// If this is an attribute, store more data needed to retrieve the attribute later.
				if (func == 'SetAttribute') {
					_addScopedAttr(realWot, o, originalStr, walker, compRef);
				}
				// Send the regular scoped variable back.
				return res;
			}
		});
	}
	return str;
};

const _replaceScopedVarsExpr = (str, compRef=null) => {
	// This function attempts to locate and replace any internal variables in a JavaScript expression or "run" function.
	let res, origWot, firstVar;
	str = str.replace(/([\u00BF-\u1FFF\u2C00-\uD7FFa-z][\u00BF-\u1FFF\u2C00-\uD7FF\w_\.\:\[\]]+)(?!\u00BF-\u1FFF\u2C00-\uD7FF\w)/gim, function(_, wot) {
		origWot = wot;
		// Don't convert to dot format as JavaScript barfs on dot notation in evaluation.
		// Evaluate the JavaScript expression.
		if (wot.indexOf('.') !== -1) {
			// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
			// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
			firstVar = wot.split('.')[0];
			// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use "scopedVars", but do a handling for that anyway.
			if (firstVar == 'window') return wot;
			if (firstVar == 'scopedVars') {
				wot = wot.replace(/^scopedVars\./, '');
			}
		}
		// Prefix with sub-scope (main or _compRef).
		wot = (compRef && privVarScopes[compRef]) ? compRef + '.' + wot : 'main.' + wot;
		res = _get(scopedVars, wot);
		if (res !== undefined) {
			// Variable definitely exists in some form.
			return 'scopedVars.' + wot;
		} else {
			return origWot;
		}
	});
	return str;
};

const _replaceStringVars = (o, str, compRef) => {
	// This function should only deal once with {$STRING}, and once with HTML variables. Gets called for different reasons, hence it's purpose is double-up here.
	// This is the function that translates HTML variables for an output string.
	let res = '';
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\[\]\.\$]+)\}/gi, function(_, innards) {
		if (innards == '$STRING') {
			if (o && o.res) {
				res = o.res;
			} else {
				res = '{$STRING}';
			}
			return res;
		} else if (innards.indexOf('$') !== -1 && ['$CHILDREN', '$SELF'].indexOf(innards) === -1) {
			// This should be treated an HTML variable string. It's a regular Active CSS variable that allows HTML.
			let scopedVar = ((compRef && privVarScopes[compRef]) ? compRef : 'main') + '.' + innards;
			res = _get(scopedVars, scopedVar);
			return res || '';
		} else {
			return '{' + innards + '}';
		}
	});
	return str;
};

const _resolveAjaxVars = o => {
	if (typeof o.res === 'object' && !o.preGet) {
		let compScope = ((o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main');
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
	}
	_ajaxCallbackDisplay(o);
};

const _resolveAjaxVarsDecl = (res, compScope) => {
	// Loop the items in res and assign to variables.
	let v;
	for (v in res) {
		// Convert escaped new lines from json into real new lines because you can't pass new lines through json. I'm not saying anything.
		_set(scopedVars, compScope + '.' + v, res[v]);
	}
};

const _resolveInnerBracketVars = str => {
	// Takes a scoped variable string and replaces the variables within brackets into true values.
	// Used in the var command so it can work with _set in the correct scope.
	if (str.indexOf('[') !== -1) {
		str = str.replace(/\[([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.]+)\]/gm, function(_, innerVariable) {
			// Is this a scoped variable?
			let res;
			if (innerVariable.substr(0, 11) == 'scopedVars.') {
				// Yes. Remove the scoped prefix.
				innerVariable = innerVariable.substr(11);
				// Get the variable value - should always be a string or a number.
				res = _get(scopedVars, innerVariable);
			} else if (innerVariable.substr(0, 7) == 'window.') {
				// Remove the window prefix.
				innerVariable = innerVariable.substr(7);
				// Get the variable value - should always be a string or a number.
				res = _get(window, innerVariable);
			} else {
				// Variable should be whatever was found.
				res = innerVariable;
			}
			return '[' + res + ']';
		});
	}
	return str;
};

const _resolvePath = (path, obj=self, separator='.') => {
	var properties = Array.isArray(path) ? path : path.split(separator);
	properties.reduce((prev, curr) => prev && prev[curr], obj);
	return obj;
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
		'_ACSS_later_double_quote': '"',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};

/***
 * Called from _observable-slim.js after a change has been made to a scoped variable.
 *
 * How variable data-binding is handled in Active CSS. (Various notes written prior to implementation, so this isn't gospel.)
 * --------------------------------------------------------------------------------------------------------------------------
 * Direct changes to attributes are not covered here - this is just what happens when variables change, not attributes. See the create-element command for that code.
 *
 * All scoped variables that are set are contained to a IIFE limited variable "scoped", and changed via the notifier Proxy "scopedVars".
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
		if (change.currentPath.indexOf('.') === -1 && change.currentPath.indexOf('HOST') === -1) continue;	// Skip all actions on the root scoped variable.
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
				dataObj = _get(scopedData, innerChange.path);
				if (!dataObj) continue;		// No point doing anything yet - it's not been rendered.
				innerChange.val = (!innerChange.val) ? '' : innerChange.val;
				_varUpdateDomDo({
					currentPath: innerChange.path,
					newValue: innerChange.val,
					type: innerChange.op
				}, dataObj);	// We need this - we may have a complex object.
			}
		} else {
			dataObj = _get(scopedData, change.currentPath);
			if (!dataObj) continue;		// No point doing anything yet - it's not been rendered.
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
			// The whole scope has been deleted. Clean up.
			delete shadowDoms[change.currentPath];
			delete scopedData[change.currentPath];
			delete actualDoms[change.currentPath];
			delete compParents[change.currentPath];
			delete compPrivEvs[change.currentPath];
			delete varMap[change.currentPath];
			delete varStyleMap[change.currentPath];

//				varInStyleMap[el._acssActiveID] = str;		// This needs cleaning up - do it when removing item from DOM in observer.

			return;
			// Note that this is only going to clean up components that contain reactive variables. At some point, we should look at a method of cleaning up
			// all component references when they are removed. Then this can possibly be removed depending on the method.
		}
	}

	// Update text nodes.
	if (typeof varMap[change.currentPath] === 'object') {
		varMap[change.currentPath].forEach((nod, i) => {	// jshint ignore:line
			if (!nod.isConnected) {
				// Clean-up.
				varMap[change.currentPath].splice(i, 1);
			} else {
				// Update node. By this point, all comments nodes surrounding the actual variable placeholder have been removed.
				nod.textContent = refObj;
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
							let val = _get(scopedVars, wot);
							return (val) ? val : _;
						}
					}
				});
				nod.textContent = str;	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
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
			el.setAttribute(attr, attrContent);
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
		let newObj = Object.assign({}, obj);
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
	return JSON.stringify(Object.assign({}, mediaQueriesOrig));
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
		str += (conditionals[arr[i]]) ? '<span class="active-event-cond-inline">' + arr[i] + '</span>' : arr[i];
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
			if (el.tagName == 'A' && el['data-active-nav'] !== 1) {
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
	return JSON.stringify(Object.assign({}, components));
};

ActiveCSS._sendOverConditionals = () => {
	return JSON.stringify(Object.assign({}, conditionals));
};

ActiveCSS._sendOverConfig = () => {
	let str = JSON.stringify(Object.assign({}, config));
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

/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _cookieExists = nam => {
    if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
   	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};

/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _getCookie = nam => {
	if (!nam) return null;
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
};

/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _setCookie = (nam, sValue, vEnd, sPath, sDomain, bSecure, bSameSite, bHttpOnly) => {
	if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
	var sExpires = '';
	if (vEnd) {
		switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
				break;
			case String:
				sExpires = '; expires=' + vEnd;
				break;
		}
	}
	document.cookie = encodeURIComponent(nam) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; Secure' : '') + (bSameSite ? '; samesite=' + bSameSite : '' + (bHttpOnly ? '; HttpOnly' : ''));
	return true;
};

const _addActValRaw = o => {
	// (AV is a reference to o.actVal)
	// Remove everything before the "?" in the file URL so we can store it for checking later.
	o.avRaw = o.actVal;
	if (o.avRaw.indexOf('?') !== -1) {
		// Remove any parameters to check if it is in configArr - store without the parameters, otherwise we get an accumulation of the same file in configArr.
		o.avRaw = _getBaseURL(o.avRaw);
	}
};

const _ajax = (getMethod, fileType, filepath, pars, callback, errcallback, varArr) => {
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
	r.onreadystatechange = function () {
		if (r.readyState != 4) return;
		if (r.status != 200) {
			preGetMid--;
			if (errcallback) {
				errcallback(r.responseText, r.status, varArr);
			} else {
				console.log('Tried to get file: ' + filepath + ', but failed with error code: ' + r.status);
				return;
			}
		}
		preGetMid--;
		if (callback !== null) {
			callback(r.responseText, varArr);
		}
	};
	if (getMethod == 'POST' && pars !== null) {
		r.send(pars);
	} else {
		r.send();
	}
};

const _ajaxCallback = (str, o) => {
	// Convert to a str if it be JSON.
	if (typeof str === 'string' && str.trim() !== '') {
		o.res = (o.dataType == 'JSON') ? JSON.parse(str) : str;
		_resolveAjaxVars(o);
		// _ajaxCallbackDisplay(o); is called from _resolveAjaxVars, as it needs to account for the asyncronyousness of the shadow DOM.
	} else {
		o.res = '';
		// Commenting out for now - this will be for ajax return feedback.
//		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
//			_debugOutput(o);	//	'', 'ajax' + ((o.preGet) ? '-pre-get' : ''));
//		}
		_ajaxCallbackDisplay(o);
	}
};

const _ajaxCallbackDisplay = (o) => {
	if (!o.error && (o.cache || o.preGet)) {
		// Store it for later. May need it in the afterAjaxPreGet event if it is run.
		ajaxResLocations[o.finalURL] = o.res;
	}
	if (!o.error && o.preGet) {
		// Run the afterAjaxPreGet event.
		_handleEvents({ obj: o.obj, evType: 'afterAjaxPreGet' + ((o.error) ? o.errorCode : ''), otherObj: o, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	} else {
		// Run the post event - success or failure.
		_ajaxDisplay(o);
	}
	delete o.res;
};

const _ajaxCallbackErr = (str, resp, o) => {
	if (!o.preGet) {
		o.error = true;
		o.errorCode = resp;
		_ajaxCallback(str, o);
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax callback error debug: failed with error "' + resp + '".');
		}
	} else {
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax-pre-get callback error debug: failed with error "' + resp + '".');
		}
	}
};

const _ajaxDisplay = o => {
	let ev = 'afterAjax' + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	if (o.error) ev += o.errorCode;
	_handleEvents({ obj: o.obj, evType: ev, otherObj: o, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	if (o.hash !== '') {
		document.location.hash = '';	// Needed as Chrome doesn't work without it.
		document.location.hash = o.hash;
	}
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
	if (ajaxResLocations[o.finalURL]) {
		// No need to get it - we have it in cache.
		if (!o.preGet) {
			// Display it. Copy the result from the cached object over to the primary selector.
			o.res = ajaxResLocations[o.finalURL];
			_resolveAjaxVars(o);
		}
	} else {
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

const _convertToMS = (tim, errMess) => {
	if (tim == 'stack') return 0;
	var match = /^(\d+)(ms|s)?$/i.exec(tim);
	if (!match) {
		console.log(errMess);
		return false;
	}
	var n = parseFloat(match[1]);
	var type = (match[2] || 'ms').toLowerCase();
	return (type == 's') ? n * 1000 : n;
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

const _eachRemoveClass = (inClass, classToRemove, doc) => {
	doc.querySelectorAll('.' + inClass).forEach(function (obj, index) {
		if (!obj) return; // element is no longer there.
		ActiveCSS._removeClassObj(obj, classToRemove);
	});
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
		console.log('Unbalanced JavaScript equation in var command - too many brackets, curlies or parentheses, or there could be incorrectly escaped characters: ' + newStr + ', in config: ' + o.file + ', line: ' + o.line);
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

// Courtesy of https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab
// Modded to return undefined if not set instead of null.
const _get = (object, keys, defaultVal=undefined) => {
	keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
	object = object[keys[0]];
	if (object && keys.length > 1) {
		return _get(object, keys.slice(1), defaultVal);
	}
	return object === undefined ? defaultVal : object;
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

const _getBaseURL = str => {
	let pos = str.indexOf('?');
	return (pos !== -1) ? str.substr(0, str.indexOf('?')) : str;
};

const _getComponentDetails = rootNode => {
	let rootNodeHost, component, compDoc, compRef, privateEvs;
	if (!rootNode.isSameNode(document)) {
		// Get the component variables so we can run this element's events in context.
		rootNodeHost = rootNode;
		if (supportsShadow && rootNode instanceof ShadowRoot) {
			rootNodeHost = rootNode.host;
		}
		component = rootNodeHost._acssComponent;
		compDoc = rootNode;
		compRef = rootNodeHost._acssCompRef;
		privateEvs = rootNodeHost._acssPrivEvs;
	} else {
		component = null;
		compDoc = null;
		compRef = null;
		privateEvs = null;
	}
	return { component, compDoc, compRef, privateEvs };
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

const _getFocusedOfNodes = (sel, o) => {
	// Find the current focused node in the list, if there is one.
	let targArr, nodes, obj, i = -1, useI = -1;
	targArr = _splitIframeEls(sel, o.obj, o.compDoc);
	if (!targArr) return false;	// invalid target.
	if (targArr[0].activeElement === null) return -1;
	nodes = targArr[0].querySelectorAll(targArr[1]) || null;
	for (obj of nodes) {
		i++;
		if (obj.isSameNode(targArr[0].activeElement)) {
			useI = i;
			break;
		}
	}
	return [ nodes, useI ];
};

const _getObj = (str) => {
	let targArr = _splitIframeEls(str);
	if (!targArr) return false;	// invalid target.
	try {
		return targArr[0].querySelector(targArr[1]);
	} catch(err) {
		return false;
	}
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
		if (['draw', 'disconnectCallback', 'adoptedCallback', 'attributeChangedCallback', 'beforeComponentOpen', 'componentOpen'].includes(ev)) return false;	// custom Active CSS events.
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

const _getSel = (o, sel, priorToGrabAll) => {
	switch (sel) {
		case 'me':
		case 'self':
		case 'this':
			return o.secSelObj;
		case 'host':
			if (['beforeComponentOpen', 'componentOpen'].indexOf(o.event) !== -1) {
				// The host is already being used as the target selector with these events.
				return o.secSelObj;
			}
			let rootNode = _getRootNode(o.secSelObj);
			return (rootNode._acssScoped) ? rootNode : rootNode.host;
		default:
			// Grab the element or the first in the group specified.
			return (priorToGrabAll !== true) ? _getObj(sel) : false;
	}
};

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

const _ifVarTrue = (val, compRef) => {
	// This needs to cater for scoped variables and also window variables.
	if (val == 'true') {
		return true;
	} else if (val == 'false') {
		return false;
	}
	let scopedVar = ((compRef && privVarScopes[compRef]) ? compRef : 'main') + '.' + val;
	let res = _get(scopedVars, scopedVar);
	if (res === undefined) {
		// If the value wasn't a variable, check if it's a window variable. If not, then just set it to its original value.
		res = window[val];
	}
	return (!res) ? false : true;
};

ActiveCSS._ifVisible = (o, tot) => {	// tot true is completely visible, false is partially visible. Used by extensions.
	let el = (typeof o.actVal === 'object') ? o.actVal : (o.actVal._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, o.actVal);	// Used by devtools highlighting.
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (tot) ? (elTop >= 0) && (elBot <= window.innerHeight) : elTop < window.innerHeight && elBot >= 0;
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
		currDocTitle = ActiveCSS._decodeHTML(e.target.cjsReset.title);
		document.title = currDocTitle;
	}
};

const _optDef = (arr, srch, opt, def) => {
	// This is a case insensitive comparison.
	if (!Array.isArray(arr)) arr = arr.split(' ');	// For speed send in an array that is already split, but this also accepts a string for a one-off use.
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

// Solution courtesy of https://github.com/cosmicanant/recursive-diff
// MIT license.
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.recursiveDiff=t():e.recursiveDiff=t()}("undefined"!=typeof self?self:this,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const{types:r,iterableTypes:o,errors:i}=n(1),l=n(2),f={[r.NUMBER]:l.isNumber,[r.BOOLEAN]:l.isBoolean,[r.STRING]:l.isString,[r.DATE]:l.isDate,[r.UNDEFINED]:l.isUndefined,[r.NULL]:l.isNull,[r.ARRAY]:l.isArray,[r.MAP]:l.isMap,[r.SET]:l.isSet,[r.ITERABLE_OBJECT]:l.isIterableObject},u={[r.DATE]:l.areDatesEqual};function a(e){const t=Object.keys(f);let n=r.DEFAULT;for(let r=0;r<t.length;r+=1)if(f[t[r]](e)){n=t[r];break}return n}function s(e,t,n,o){let i;return n===r.UNDEFINED&&o!==r.UNDEFINED?i="add":n!==r.UNDEFINED&&o===r.UNDEFINED?i="delete":!function(e,t,n,r){return n===r&&(u[n]?u[n](e,t):e===t)}(e,t,n,o)?i="update":l.noop(),i}function c(e,t,n,i,l){const f=a(e),u=a(t),p=i||[],d=l||[];if(function(e,t){return e===t&&o.indexOf(e)>=0}(f,u)){const o=function(e,t,n){let o;return n===r.ITERABLE_OBJECT?o=new Set(Object.keys(e).concat(Object.keys(t))):n===r.ARRAY&&(o=e.length>t.length?new Array(e.length):new Array(t.length),o=o.fill(0,0),o=o.map((e,t)=>t),o=new Set(o)),o}(e,t,f).values();let i=o.next().value;for(;null!=i;)c(e[i],t[i],n,p.concat(i),d),i=o.next().value}else{const r=s(e,t,f,u);null!=r&&d.push(function(e,t,n,r,o){const i={op:n,path:r};return"add"!==n&&"update"!==n||(i.val=t),o&&"add"!==n&&(i.oldVal=e),i}(e,t,r,i,n))}return d}const p={add:l.setValueByPath,update:l.setValueByPath,delete:l.deleteValueByPath};e.exports={getDiff:(e,t,n=!1)=>c(e,t,n),applyDiff:(e,t,n)=>function(e,t,n){if(!(t instanceof Array))throw new Error(i.INVALID_DIFF_FORMAT);let r=e;return t.forEach(e=>{const{op:t,val:o,path:l}=e;if(!p[t])throw new Error(i.INVALID_DIFF_OP);r=p[t](r,l,o,n)}),r}(e,t,n)}},function(e,t){const n={NUMBER:"NUMBER",BOOLEAN:"BOOLEAN",STRING:"STRING",NULL:"NULL",UNDEFINED:"UNDEFINED",DATE:"DATE",ARRAY:"ARRAY",MAP:"MAP",SET:"SET",ITERABLE_OBJECT:"ITERABLE_OBJECT",DEFAULT:"OBJECT"};e.exports={types:n,iterableTypes:[n.ITERABLE_OBJECT,n.MAP,n.ARRAY,n.SET],errors:{EMPTY_DIFF:"No diff object is provided, Nothing to apply",INVALID_DIFF_FORMAT:"Invalid diff format",INVALID_DIFF_OP:"Unsupported operation provided into diff object"}}},function(e,t){const n=e=>t=>t instanceof e,r=n(Date),o=n(Array),i=n(Map),l=n(Set),f=e=>"[object Object]"===Object.prototype.toString.call(e);e.exports={isNumber:e=>"number"==typeof e,isBoolean:e=>"boolean"==typeof e,isString:e=>"string"==typeof e,isDate:r,isUndefined:e=>void 0===e,isNull:e=>null===e,isArray:o,isMap:i,isSet:l,isIterableObject:f,noop:()=>{},areDatesEqual:(e,t)=>e.getTime()===t.getTime(),setValueByPath:function(e,t=[],n,r){if(!o(t))throw new Error(`Diff path: "${t}" is not valid`);const{length:i}=t;if(0===i)return n;let l=e;for(let o=0;o<i;o+=1){const f=t[o];if(!l)throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);if(null==f)throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);o!==i-1?(l=l[f],r&&r(l)):l[f]=n}return e},deleteValueByPath:function(e,t){const n=t||[];if(0===n.length)return;let r=e;const{length:o}=n;for(let i=0;i<o;i+=1)if(i!==o-1){if(!r[n[i]])throw new Error(`Invalid path: "${t}" for object: ${JSON.stringify(e,null,2)}`);r=r[n[i]]}else if(f(r))delete r[n[i]];else{const e=parseInt(n[i],10);for(;r.length>e;)r.pop()}return e}}}])}));	// jshint ignore:line
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
    let orig = document.location.href, st = history.state, t = document.title;
    history.replaceState(st, t, url);
    let resUrl = document.location.href;
    history.replaceState(st, t, orig);
    return resUrl;
};

const _selCompare = (o, opt) => {
	// Takes two parameters. First a selector, and secondly something else to compare.
	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl, compareVal;
	if (opt == 'eM') {
		// There can be only one (parameter).
		if (!actVal) return true;	// No point going further - this could be a variable substitution that equates to empty.
		if (actVal && actVal == '__object') return false;	// No point going further - this is not empty - it is an array or a variable object.
		spl = actVal._ACSSSpaceQuoOut();
	} else {
		// There are two parameters with this conditional.
		spl = actVal.split(' ');
		compareVal = spl.pop()._ACSSSpaceQuoOut()._ACSSRepQuo();
		spl = spl.join(' ');
	} 
	let el;
	el = _getSel(o, spl);
	if (!el) {
		el = spl;
	}
	switch (opt) {
		case 'eM':
		case 'maL':
		case 'miL':
			// _c.IfEmpty, _c.IfMaxLength, _c.IfMinLength
			let firstVal;
			if (el && el.nodeType && el.nodeType == Node.ELEMENT_NODE) {
				let valWot = _getFieldValType(el);
				firstVal = el[valWot];
			} else {
				firstVal = el;
			}
			switch (opt) {
				case 'eM':
					return (!firstVal || firstVal === '');
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
	}
};

// Courtesy of https://stackoverflow.com/a/54733755
// See stackoverflow for full comments.
const _set = (obj, path, value) => {
	if (Object(obj) !== obj) return obj;
	if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
	path.slice(0,-1).reduce((a, c, i) =>
		Object(a[c]) === a[c] ? a[c] : a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}, obj)[path[path.length - 1]] = value;
	return obj;
};

const _setClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.className = str;
};

const _setsrcObj = (obj, inSrc) => {
	if (!obj) return; // element is no longer there.
	obj.src = inSrc;
};

const _toggleClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.classList.toggle(str);
};

const _urlTitle = (url, titl, o) => {
	url = url.replace(/"/g, '');
	titl = titl.replace(/"/g, '');
	url = _resolveURL(url);
	if (window.location.href != url) {
		window.history.pushState(url, titl, url);
	}
	document.title = titl;
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
	return this._ACSSCapitalizeAttr().replace(/\-/g, '');
};

String.prototype._ACSSRepQuo = function() {
	var html = this.replace(/\\"/g, '_ACSS*�%_');
	html = html.replace(/"/g, '');
	html = html.replace(/_ACSS\*�%_/g, '"');
	return html;
};

String.prototype._ACSSSpaceQuoIn = function() {
	let str = this.replace(/"(.+?)"/g, function(_, innards) {
		innards = '"' + innards.replace(/ /g, '_ACSS_space') + '"';
		return innards;
	});
	return str;
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
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

	// Is there inline Active CSS? If so, initiate the core.
	document.addEventListener('DOMContentLoaded', function(e) {
		setTimeout(function() {
			// User setup should have started by this point. If not, initialise Active CSS anyway.
			// If there is a user setup initialized, then inline acss is handled there and not here.
			// This is so that _readSiteMap happens at the end of config accumulation and we can fire all the initalization events at once.
			if (!userSetupStarted) {
				autoStartInit = true;
				ActiveCSS.init();
			}
		}, 0);
	});
}(window, document));
