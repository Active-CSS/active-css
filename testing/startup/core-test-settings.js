/**********/
/* README */
/**********/

/********************
* Each test has it's own directory containing the Active CSS config along with the corresponding JavaScript test. These are concatenated during the grunt process into
* one Active CSS config file and one JavaScript file.
*
* Karma is being used because we want to test the DOM results in a real browser, and Karma can load up headless browsers for testing purposes.
* Jasmine is being used as an interface between Karma and Active CSS.
*
* The compiled Active CSS test config file gets loaded into Active CSS from Jasmine (core-test-start.js) when the Karma browser page is initialised.
* The JavaScript file containing verification for tests gets loaded from Karma into the headless browser (see karma.conf.js).
*
* Active CSS then starts off all the tests.
* Active CSS tests are performed within Active CSS because it makes more sense to report on results where they can be easily checked.
* Things like shadow DOM, scoped variables, testing internal events, etc. are easier to test inside the Active CSS flow itself.
*
* Whenever a test is passed in Active CSS, the test container div in the headless browser page gets a class added of "success".
* When all the tests are done, in Jasmine the test container divs are looped and a check is done for this "success" class. If it isn't present then it fails the test
* and the results are reported.
* 
* The way this is done currently is easy to read, maintain and very easy to add new tests.
*
**/

/***********************/
/* Tweakable variables */
/***********************/

// How long does it take to get each headless browser initialised before the tests start running? This really depends on how fast your server is.
const browserSetupInSeconds = 2;

// All Active CSS tests run right away, but there can be delays like "after 2s", so we only check all the test results after a certain time.
// For the sake of simplicity and maintenance, it's easier just to not check the results until we know everything has been run.
// What is the maximum delay in any test to be safe everything has run?
const timeToRunTestsInSeconds = 3;		// 3 seconds and then we check all the test results. No one test takes more than 3 seconds to run.

// If your server is really slow, you might want to change this.
const generalServerSlownessInSeconds = 0;
