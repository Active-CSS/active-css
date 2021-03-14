/*jslint browser: true */
/*global alert, console, getSelection, inspect, self, window  */

(function (global, document) {
	'use strict';
	const CHILDRENREGEX = /\{\$CHILDREN\}/g,
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
		DYNAMICCHARS = {
			',': '_ACSS_later_comma',
			'{': '_ACSS_later_brace_start',
			'}': '_ACSS_later_brace_end',
			';': '_ACSS_later_semi_colon',
			':': '_ACSS_later_colon',
			'"': '_ACSS_later_double_quote'
		},
		PARSEATTR = 3,
		PARSEDEBUG = 4,
		PARSEEND = 2,
		PARSELINEX = /([^\:]+):([^\;]*)(;)?/,
		PARSEREGEX = /((?!\*debugfile)[^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|((?!\*debugfile)[^\;\{\}]+\;(?!\s*\*\/))|(\*debugfile[\s\S]*?\*)/gmi,
		PARSESEL = 1,
		RANDCHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		RANDNUMS = '0123456789',
		SELFREGEX = /\{\$SELF\}/g,
		STYLEREGEX = /\/\*active\-var\-([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\: \[\]]+)\*\/(((?!\/\*).)*)\/\*\/active\-var\*\//g,
		UNIQUEREF = Math.floor(Math.random() * 10000000);

	// Lodash vars for _get & _set. These are all vars in the original source.
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
		reIsPlainProp = /^\w*$/,
		rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
		INFINITY = 1 / 0,
		MAX_SAFE_INTEGER = 9007199254740991,
		reIsUint = /^(?:0|[1-9]\d*)$/,
		reEscapeChar = /\\(\\)?/g,
		isArray = Array.isArray,
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
	var coreVersionExtension = '2-0-0',			// ok
		// Active CSS action commands.
		_a = {},								// ok
		// Active CSS conditionals.
		_c = {},								// ok
		activeIDTrack = 0,						// ok
		actualDoms = {},						// Use: actualDoms[varScope]
		ajaxResLocations = {},					// ok
		allEvents = [],							// ok
		autoStartInit = false,					// ok
		cancelIDArr = [],						// Use: cancelIDArr[activeID]. For custom targets: cancelIDArr[delayRef] (see _handleFuncs, etc.)
		cancelCustomArr = [],					// Use: cancelCustomArr[delayRef] (see _handleFuncs and other - needs investigating of contents)
		clickOutsideSels = [],					// Use: clickOutsideSels[activeID]
		clickOutsideSet = false,				// ok
		compCount = 0,							// Sets the number of the component scope. ok
		components = [],						// ok
		compPending = {},						// Use: compPending[varScope]
		compParents = [],						// Use: compParents[evScope]
		compPrivEvs = [],						// Use: compPrivEvs[evScope]
		config = [],							// ok
		configArr = [],							// ok
		configBox = [],							// ok
		configFile = '',						// ok
		configLine = '',						// ok
		concatConfigCo = 0,						// ok
		concatConfigLen = 0,					// ok
		conditionals = [],						// ok
		currDocTitle = document.title,			// ok
		currentPage = '',						// ok
		customTags = [],						// Needs deleting when the create-element command is removed.
		debuggerActive = false,					// ok
		debuggerCo = 0,							// ok
		debuggerEvs = [ 'afterLoadConfig' ],	// ok
		debuggerExtID = null,					// ok
		debuggerness = false,					// ok
		debugMode = '',							// ok
		delayArr = [],							// Use: delayArr[activeID]. For custom targets: delayArr[delayRef] (see _handleFuncs, etc.)
		devtoolsInit = [],						// ok
		doesPassive = false,					// ok
		elementObserver,						// ok
		evEditorExtID = null,					// ok
		evEditorActive = false,					// ok
		eventState = {},						// ok
		flyCommands = [],						// Use: flyCommands[funcName]. Needs deleting when the create-command command is removed.
		flyConds = [],							// Use: flyConds[funcName]. Needs deleting when the create-conditional command is removed.
		idMap = [],								// Use: should be idMap[activeID], but there's a idMap[o.secSelObj] in there, so that needs to be consistent.
		inIframe = (window.location !== window.parent.location),	// ok
		inlineIDArr = [],						// ok
		intIDCounter = 0,						// ok
		labelData = [],							// ok
		labelByIDs = [],						// ok
		lazyConfig = '',
		localStoreVars = [],
		maEv = [],
		mainEventCounter = -1,
		masterConfigCo = 0,
		mediaQueries = [],
		mediaQueriesOrig = [],
		mimicClones = [],
		nonPassiveEvents = [],
		pageList = [],
		pagesDisplayed = [],
		pageStore,
		parsedConfig = {},				// ok
		passiveEvents = true,
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
		strictCompPrivEvs = [],			// Use: strictCompPrivEvs[evScope]
		strictPrivVarScopes = [],		// Use: strictPrivVarScopes[evScope]
		supportsShadow = true,
		taEv = [],
		targetEventCounter = -1,
		userSetupStarted = false,
		varMap = [],
		varStyleMap = [],
		varInStyleMap = [],
		varReplaceRef = 0;

	ActiveCSS.customHTMLElements = {};

/* Closure in _core-end.js */