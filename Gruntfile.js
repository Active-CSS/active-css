// Active CSS core generator.
// Concatenate, lint-check, minify, then unit test.
(function () {
   'use strict';

	module.exports = function(grunt) {
		grunt.initConfig({
			// Custom variables.
			realVersion: '2.9.0',
			fileVersion: '2-9-0',

			pkg: grunt.file.readJSON('package.json'),

			// Concatenate all the multiple files per edition.
			concat: {
				devEdition: {
					src: [
						'src/core/_core-start.js',	// This goes first, always.
						'src/commands/built-in/*.js',	// Doesn't matter which order these have.
						'src/commands/external-commands/*.js',
						'src/conditionals/*.js',
						'src/core/delay-handling/*.js',
						'src/core/runtime/**/*.js',
						'src/core/startup/**/*.js',
						'src/core/await-handling/*.js',
						'src/core/var-handling/*.js',
						'src/dev-version/common/*.js',
						'src/dev-version/elements/*.js',
						'src/dev-version/panel/*.js',
						'src/utils/cookies/*.js',
						'src/utils/dom-basic/*.js',
						'src/utils/file-handling/*.js',
						'src/utils/general/*.js',
						'src/utils/lodash/*.js',
						'src/utils/prototypes/*.js',
						'src/core/_core-end.js'	// This goes last, always.
					],
					dest: 'dist/v-<%= fileVersion %>/activecss-core-dev-<%= fileVersion %>.js'
				},
				prodEdition: {
					src: [
						'src/core/_core-start.js',
						'src/commands/built-in/*.js',
						'src/commands/external-commands/*.js',
						'src/conditionals/*.js',
						'src/core/delay-handling/*.js',
						'src/core/runtime/**/*.js',
						'src/core/startup/**/*.js',
						'src/core/await-handling/*.js',
						'src/core/var-handling/*.js',
						'src/utils/cookies/*.js',
						'src/utils/dom-basic/*.js',
						'src/utils/file-handling/*.js',
						'src/utils/general/*.js',
						'src/utils/lodash/*.js',
						'src/utils/prototypes/*.js',
						'src/core/_core-end.js'
					],
					dest: 'dist/v-<%= fileVersion %>/full-source/prod.js'
				},
				testingJS: {
					src: [
						'core-test/helpers/start/helpers-start.js',	// This goes first, always.
						'core-test/helpers/functions/**/*.js',
						'core-test/tests/initialize/**/*.js',
						'core-test/tests/to-run-first/**/*.js',
						'core-test/tests/commands/**/*.js',
						'core-test/tests/components/**/*.js',
						'core-test/tests/conditionals/**/*.js',
						'core-test/tests/core/**/*.js',
					],
					dest: 'core-test/startup/compiled/core-test-js.js'
				},
				testingConfig: {
					src: [
						'core-test/tests/initialize/**/*.acss',
						'core-test/tests/to-run-first/**/*.acss',
						'core-test/tests/commands/**/*.acss',
						'core-test/tests/components/**/*.acss',
						'core-test/tests/conditionals/**/*.acss',
						'core-test/tests/core/**/*.acss',
					],
					dest: 'core-test/startup/compiled/core-test-config.acss'
				},
			},

			// Lint the concatenated files. This can only happen when the core is combined.
			jshint: {
				files: [
					'Gruntfile.js',
					'dist/v-<%= fileVersion %>/activecss-core-dev-<%= fileVersion %>.js',
					'dist/v-<%= fileVersion %>/full-source/prod.js',
					'core-test/startup/compiled/core-test-js.js'
				],
				options: {
					esversion: 9,	// It gets it wrong, it doesn't work with ES6 spread operators. It thinks that came out in ES9.
					strict: true
				}
			},

			// Comment out for no babel.
/*
			babel: {
				options: {
					presets: ['env']
				},
				dist: {
					files: {
						'dist/v-<%= fileVersion %>/full-source/activecss-babel-<%= fileVersion %>.js': 'dist/v-<%= fileVersion %>/full-source/prod.js',
						'dist/v-<%= fileVersion %>/full-source/activecss-babel-dev-<%= fileVersion %>.js': 'dist/v-<%= fileVersion %>/activecss-core-dev-<%= fileVersion %>.js'
					}
				},
			},
*/

			// Terse the different versions after lint-check and put them into the version directory.
			terser: {
				regular: {
					options: {
						ecma: '2015',	// Do not change this.
						keep_classnames: true,
					},
					files: {
						'dist/v-<%= fileVersion %>/activecss-<%= fileVersion %>.min.js': ['dist/v-<%= fileVersion %>/full-source/prod.js'],
						'dist/v-<%= fileVersion %>/activecss-dev-<%= fileVersion %>.min.js': ['dist/v-<%= fileVersion %>/activecss-core-dev-<%= fileVersion %>.js']
					}
				},

				// Comment out for no babel.
/*
				babel: {
					options: {
//						ie8: true,
						keep_classnames: true,
						safari10: true
					},
					files: {
						'dist/v-<%= fileVersion %>/activecss-babel-<%= fileVersion %>.min.js': ['dist/v-<%= fileVersion %>/full-source/activecss-babel-<%= fileVersion %>.js'],
						'dist/v-<%= fileVersion %>/activecss-babel-dev-<%= fileVersion %>.min.js': ['dist/v-<%= fileVersion %>/full-source/activecss-babel-dev-<%= fileVersion %>.js']
					}
				}
*/
			},

			// Run the tests with jasmine via karma.
			karma: {
				tests: {
					configFile: 'karma.conf.js'
				}
			},
		});

		// Run tasks
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-terser');
		grunt.loadNpmTasks('grunt-karma');
		// Comment out for no babel.
//		grunt.loadNpmTasks('grunt-babel');

		// Comment out for no babel.
//		grunt.registerTask('default', ['concat', 'jshint', 'babel', 'terser', 'karma' ]);

		// Comment out if you don't want Karma testing in order to speed up dev process. Always put it back before a final commit and ensure all tests work.
		// Ensure karma.conf.js is using the correct core to test! ie. const activeCSSVersion = '2-4-3';
		grunt.registerTask('default', ['concat', 'jshint', 'terser', 'karma' ]);
//		grunt.registerTask('default', ['concat', 'jshint', 'terser' ]);
	};

}());
