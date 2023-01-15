/*jslint browser: true */
/*global alert, console, getSelection, inspect, self, window  */

/***
	When compiling the core, this file always goes first, and _core-end.js always goes last.
	The sequence of the other files shouldn't matter - they should be just functions. They can be given a sequence if need dictates though.
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
		CUSTOMEVENTS = [
			'adoptedCallback',
			'attributeChangedCallback',
			'beforeComponentOpen',
			'clickoutside',
			'componentOpen',
			'connectedCallback',
			'draw',
			'disconnectCallback',
			'innerhtmlchange',
			'observe'
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
		INQUOTES = /("([^"]|"")*")/gm,
		LABELREGEX = /(label [\u00BF-\u1FFF\u2C00-\uD7FF\w\$\{\@\}\-]+)(?=(?:[^"]|"[^"]*")*)/gm,
		MEMAP = [ '&', 'self', 'this', 'me', 'D7460N' ],
		PARSEATTR = 3,
		PARSEDEBUG = 4,
		PARSEEND = 2,
		PARSELINEX = /(([^\:]+):([^\;]*)|(\$[\u00BF-\u1FFF\u2C00-\uD7FF\w]+)([\+\-]+)?);/,
		PARSEREGEX = /((?!\*debugfile)[^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|((?!\*debugfile)[^\;\{\}]+\;(?!\s*\*\/))|(\*debugfile[\s\S]*?\*)/gmi,
		PARSESEL = 1,
		RANDHEX = 'ABCDEF',
		RANDNUMS = '0123456789',
		REGEXCHARS = /[\\^$.*+?\/()[\]{}|]/g,
		SELFREGEX = /\{\$SELF\}/g,
		WRAPSTATEMENTS = [ '@media', '@support' ],
		INNERSTATEMENTS = [ '@each', '@else', '@for', '@if', '@while' ],
		STYLEREGEX = /\/\*active\-var\-([\u00BF-\u1FFF\u2C00-\uD7FF\w\$\-\.\: \[\]]+)\*\/(((?!\/\*).)*)\/\*\/active\-var\*\//g,
		SUPPORT_ED = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false),
		TABLEREGEX = /^\s*<t(r|d|body)/m,
		TIMEDREGEX = /(^|\s)(after|every) (0|stack|\{\=[\s\S]*?\=\}|[\{\@\u00BF-\u1FFF\u2C00-\uD7FF\w\$\-\.\:\[\]]+(\})?(s|ms)?)(?=([^"\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$)/gm,
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
		compIO,
		components = [],
		compPending = {},
		compPendingHTML = {},
		compPendingHTMLCo = 0,
		compPendingJSON = {},
		compPendingJSONCo = 0,
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
		pauseTrack = {},
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
