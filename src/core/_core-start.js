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
//	const COMMENTS = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;	// This doesn't handle user content very well. May do something else later - leave here for ref.
	const COMMENTS = /\/\*[\s\S]*?\*\/|(\t| |^)\/\/.*$/gm;

	// Note: COLONSELS should be kept up-to-date with any new selector conditions/functions.
	// Don't forget that double backslashes are needed with quoted regexes.
	const COLONSELS = '^(' +
		// Word not followed by another name type character.
		'(active|any\\-link|blank|checked|current|default|disabled|drop|empty|enabled|first\\-child|first\\-of\\-type|focus|focus\\-visible|focus\\-within|future|hover|indeterminate|in\\-range|invalid|last\\-child|last\\-of\\-type|link|local\\-link|only\\-child|only\\-of\\-type|optional|out\\-of\\-range|past|paused|placeholder\\-shown|playing|read\\-only|read\\-write|required|root|host|scope|target|target\\-within|user\\-error|user\\-invalid|valid|visited)(?![\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w_\\-])|' +
		// Word and opening parenthesis.
		'(current|dir|drop|has|is|lang|host\\-context|not|nth\\-column|nth\\-child|nth\\-last\\-child|nth\\-last\\-column|nth\\-last\\-of\\-type|nth\\-of\\-type|where)\\(' +
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
	const CHILDRENREGEX = /\{\$CHILDREN\}/g;
	const SELFREGEX = /\{\$SELF\}/g;

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
		configBox = [],
		lazyConfig = [],
		concatConfigCo = 0,
		concatConfigLen = 0,
		masterConfigCo = 0,
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
		strictPrivVarScopes = [],
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
		supportsShadow = true,
		idMap = [],
		varMap = [],
		varStyleMap = [],
		varInStyleMap = [],
		maEv = [],
		mainEventCounter = -1,
		taEv = [],
		targetEventCounter = -1,
		elementObserver,
		pageStore,
		pagesDisplayed = [],
		inlineRefCo = 0,
		inlineRefArr = [],
		inlineIDArr = [],
		inIframe = (window.location !== window.parent.location),
		htmlRawMap = [];

	ActiveCSS.customHTMLElements = {};

/* Closure in _core-end.js */