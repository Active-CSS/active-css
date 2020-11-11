/*
	Still to set up:
// func: checkFuncArr [1, 2, "cheesey wotsit"];
// func: checkFuncObj {dave: "hi"};
// func: checkFuncWinVar window.globIt;
// func: checkFuncACSSVar {myACSSVariable};
// func: checkFuncExpr {= 7 + 10 =};
// func: checkFuncCombined [1, 2, "cheesey wotsit"] {dave: "hi"} window.globIt {myACSSVariable} {= new Date =};
*/

// func: checkFuncNum 8;
function checkFuncNum(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== 8) _fail(testEl, 'Did not receive the number 8 in checkFuncNum().');
}

// func: checkFuncStr "test string";
function checkFuncStr(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== "test string") _fail(testEl, 'Did not receive the string "test string" in checkFuncStr().');
}

// func: checkFuncTrue true;
function checkFuncTrue(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== true) _fail(testEl, 'Did not receive boolean true in checkFuncTrue().');
}

// func: checkFuncFalse false;
function checkFuncFalse(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== false) _fail(testEl, 'Did not receive boolean false in checkFuncTrue().');
}

function checkFuncFinal(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	_addSuccessClass(testEl);	// Only adds a success class if it hasn't specifically failed already.
}
