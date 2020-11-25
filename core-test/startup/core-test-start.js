/********************************************************************************************************************************
*
* You can tweak the variables in the settings file (not this file) for your own server if you need to.
* I strongly recommend you don't change this code. Jasmine is quite delicate and specific in where you can do stuff.
* On my setup at least, the mildest change to this code can give unfathomably weird responses. You need to know Jasmine well to set it up.
* Currently it seems to be working properly, consistently. So only change this code if you know what you are doing.
*
***/

jasmine.DEFAULT_TIMEOUT_INTERVAL = (timeToRunTestsInSeconds + browserSetupInSeconds + generalServerSlownessInSeconds + 1) * 1000;

describe('Set up core to test', function() {
	beforeAll(async function() {
		// Set the viewport size before initializing Active CSS.
		viewport.set(viewportWidth, viewportHeight);
		// Note, Karma uses /base as the starting point for all ajax loads in headless browsers.
		await ActiveCSS.init({
			configLocation: '/base/core-test/startup/compiled/core-test-config.acss'	// *Never* edit this file directly. It is auto-generated from the tests dir.
		});
	});

	beforeEach(function(done) {
		setTimeout(function() {
// Tests were originally started with a click. Leave this in case a reference to how to do this in Jasmine is needed.
//			let obj = document.querySelector('#content');
//			obj.addEventListener('click', function(e) {}, {capture: true, once: true});	// once = automatically removed after running.
//			obj.click();
			done();
		}, (browserSetupInSeconds + generalServerSlownessInSeconds) * 1000);
	});

	// Each test has now been started.
	// Each div on the page (in the document scope) that has a wrapper class of "coreTest" is a wrapper for a test, whether html is actually used for the test or not.
	// We are going to check for an expected div class of "success" in each of these wrapping divs on the page.
	// If the class is not there, the test fails with a message to say which test failed.
  	it('should verify the results from the Active CSS tests', function(done) {
  		// Wait for a bit until the tests are complete.
		setTimeout(function() {
			// Get the required data about the elements on the page.
			let listOfTestElements = [];
			document.querySelectorAll('.coreTest').forEach(function (obj) {
				listOfTestElements.push({
					thisTitle: obj.getAttribute('data-desc'),
					thisResult: obj.classList.contains('success')
				});
			});
			// Interrogate the data and display any failed tests. We don't show successful tests as they get in the way of seeing what has failed.
			if (listOfTestElements.length == 0) {
				console.log('No test divs found. Something went weird. Check the setup.');
				done();
			} else {
				let failedTests = "\n" + 'But the following tests failed:' + "\n\n";
				let allSuccess = true;
				listOfTestElements.forEach(function ({ thisTitle, thisResult }) {
					if (!thisResult) {
						failedTests += '******** ' + thisTitle + "\n";
						allSuccess = false;
					}
				});
				// window.testsRun is set up in the Active CSS config. See /core-test/tests/core-test-config-base.acss.
				let descs = "\n\n" + 'The following tests were run:' + "\n\n";
				window.testsRun.forEach(i => {
					descs += i.desc + "\n";
				});
				if (allSuccess) {
					descs += "\n" + 'And all tests passed!' + "\n\n";

					// ASCII art courtesy of TL, https://www.asciiart.eu/computers/smileys
					descs += "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$'               `$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n";
					descs += "$$$$$$$$$$$$$$$$$$$$$$$$$$$$'                   `$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n";
					descs += "$$$'`$$$$$$$$$$$$$'`$$$$$$!                       !$$$$$$'`$$$$$$$$$$$$$'`$$$\n";
					descs += "$$$$  $$$$$$$$$$$  $$$$$$$                         $$$$$$$  $$$$$$$$$$$  $$$$\n";
					descs += "$$$$. `$' \\' \\$`  $$$$$$$!                         !$$$$$$$  '$/ `/ `$' .$$$$\n";
					descs += "$$$$$. !\\  i  i .$$$$$$$$                           $$$$$$$$. i  i  /! .$$$$$\n";
					descs += "$$$$$$   `--`--.$$$$$$$$$                           $$$$$$$$$.--'--'   $$$$$$\n";
					descs += "$$$$$$L        `$$$$$^^$$                           $$^^$$$$$'        J$$$$$$\n";
					descs += "$$$$$$$.   .'   \"\"~   $$$    $.                 .$  $$$   ~\"\"   `.   .$$$$$$$\n";
					descs += "$$$$$$$$.  ;      .e$$$$$!    $$.             .$$  !$$$$$e,      ;  .$$$$$$$$\n";
					descs += "$$$$$$$$$   `.$$$$$$$$$$$$     $$$.         .$$$   $$$$$$$$$$$$.'   $$$$$$$$$\n";
					descs += "$$$$$$$$    .$$$$$$$$$$$$$!     $$`$$$$$$$$'$$    !$$$$$$$$$$$$$.    $$$$$$$$\n";
					descs += "$JT&yd$     $$$$$$$$$$$$$$$$.    $    $$    $   .$$$$$$$$$$$$$$$$     $by&TL$\n";
					descs += "                                 $    $$    $\n";
					descs += "                                 $.   $$   .$\n";
					descs += "                                 `$        $'\n";
					descs += "                                  `$$$$$$$$'\n\n";

				} else {
					descs += failedTests + "\n";
				}
				done();
				if (allSuccess) {
					expect(true).toEqual(true);
				} else {
					expect('the tests').toEqual('a pass');
				}
				console.log(descs);
			}
		}, timeToRunTestsInSeconds * 1000);
	});
});
