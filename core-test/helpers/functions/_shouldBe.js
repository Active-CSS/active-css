// This compares a variable against a value and gives an error to the test element if it fails.
// Successes are skipped. A test will fail if receiving a failing test flag regardless of whether or not a success flag is added for a test.
function _shouldBe(testEl, varName, varVal, comparisonVal) {
	let checkVarEl = _initTest('checkVar');
	if (!checkVarEl) return;

	if (varVal !== comparisonVal) {
		_fail(checkVarEl, 'The variable "' + varName + '" does not exactly equal ' + comparisonVal + ' it equals:', typeof varVal, varVal);
	}
}
