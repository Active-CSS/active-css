/* Karma configuration for Active CSS testing.

	Particular notes to do with browsers.
	1) Ensure firefox and chrome are installed in your actual OS, so not via npm. Forking the core isn't enough - you need to apt install firefox, etc.
	2) The following need to be set, wherever they are installed (use find / -name "firefox*" or whatever to find the right dir - you're looking for "bin" probably):
		export CHROME_BIN=/usr/bin/chromium-browser
		export FIREFOX_BIN=/usr/bin/firefox
		Store these permanently in ~/.profile or however you do it.
	3) Other browsers that could be used for unit testing are not easily available on linux, or are not available in headless mode. May be worth seeing if it's practical
		to use something like browserstack with karma at some point.
	4) PhantomJS does not support ES6 or shadow DOM, so it isn't used for testing.
*/

module.exports = function(config) {

	/* Core version */
	const activeCSSVersion = '2-4-0';

	/* Core files (comment as required) */
	const activeCSSProduction = 'dist/v-' + activeCSSVersion + '/activecss-' + activeCSSVersion + '.min.js';
//	const activeCSSDev = 'dist/v-' + activeCSSVersion + '/activecss-dev-' + activeCSSVersion + '.min.js';
//	const activeCSSCoreDev = 'dist/v-' + activeCSSVersion + '/activecss-core-dev-' + activeCSSVersion + '.js';

	const activeCSSFile = activeCSSProduction;
//	const activeCSSFile = activeCSSDev;
//	const activeCSSFile = activeCSSCoreDev;

	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// See here for available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		// Note that frameworks are loaded from right to left.
		frameworks: ['jasmine', 'es6-shim'],

		// list of files / patterns to load in the browser
		files: [
			{pattern: 'core-test-area/**/*.acss', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			{pattern: 'core-test-area/tests/ajax-response-files/*.txt', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			{pattern: 'core-test-area/tests/ajax-response-files/*.gif', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			{pattern: 'core-test-area/tests/ajax-response-files/*.png', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			{pattern: 'core-test-area/tests/ajax-response-files/*.jpg', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			{pattern: 'core-test-area/tests/ajax-response-files/*.js', watched: false, included: false, served: true, nocache: false},	// Needed to load the Active CSS config file later.
			activeCSSFile,
			'core-test-area/startup/core-test-settings.js',
			'core-test-area/startup/compiled/core-test-js.js',		// *Never* edit this file directly. It is auto-generated from the tests dir.
			'core-test-area/startup/core-test-start.js',
		],

		// list of files / patterns to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// See here for potentially available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		// Don't bother with PhantomJS as it doesn't support ES6. Safari doesn't yet do headless. Edge isn't out yet on linux. IE doesn't fully support ES6.
		// Opera isn't available as a package, so that's more trouble than it's worth as it's chromium anyway.
		// Add in Safari and Edge if and when these become available as packages. Add in Opera when it's a proper package.
		// Firefox and Chrome are different browsers, so both of these are worth doing.
//		browsers: ['ChromeHeadless', 'FirefoxHeadless'],
		// Before ready to commit, unless you have a fast server it might be worth just using this one and commenting the other browsers out.
		browsers: ['ChromeHeadless'],

		customLaunchers: {
			'FirefoxHeadless': {
				base: 'Firefox',
				flags: [
					'-headless',
				]
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
//		concurrency: Infinity
		concurrency: 1	// Mainly because on my sloth-slow server Firefox times out. But also because it's easier to what is going on.
	})
}
