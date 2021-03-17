function checkVar(o, pars) {
	let checkVarEl = _initTest('checkVar');
	if (!checkVarEl) return;

	_shouldBe(checkVarEl, 'varTestString', pars[0], 'Hi, "dude".');
	_shouldBe(checkVarEl, 'varTestBooleanTrue', pars[1], true);
	_shouldBe(checkVarEl, 'varTestBooleanFalse', pars[2], false);
	_shouldBe(checkVarEl, 'varTestBooleanDigitPositive', pars[3], 10);
	_shouldBe(checkVarEl, 'varTestBooleanDigitNegative', pars[4], -20);
	_shouldBe(checkVarEl, 'varTestEvaluatedNumber', pars[5], 8);
	_shouldBe(checkVarEl, 'window.varTestWinVar as a parameter', pars[6], 'hello');
	_shouldBe(checkVarEl, 'window.varTestWinVar as a variable', window.varTestWinVar, 'hello');
	_shouldBe(checkVarEl, 'varTestArrayAssign', pars[7], true);

	// The test will not pass if any of the above comparisons fail. The success flag added below will be ignored by the test system.
	_addSuccessClass(checkVarEl);
}
