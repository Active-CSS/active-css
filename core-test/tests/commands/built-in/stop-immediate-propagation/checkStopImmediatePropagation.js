// This needs to be setup here before Active CSS starts up for a valid test.
// This is very similar to the stop-immediate-event-propagation test. It's good enough if it does the same thing in practice. If it didn't pass this then
// something would be wrong with the way the browser itself was handling it - as long as Active CSS runs event.stopImmediatePropagation() correctly.
window.checkStopImmedPropagationRealClickVarDiv = 0;

document.body.addEventListener('click', function (e) {
	let stopImmedPropEl = _getObj('#checkStopImmedPropA');
	if (stopImmedPropEl && e.target == stopImmedPropEl) {
		window.checkStopImmedPropagationRealClickVarDiv = 1;
	}
}, { capture: true });

function checkStopImmediatePropagation(o, pars) {
	let checkStopImmediatePropagationEl = _initTest('checkStopImmediatePropagation');
	if (!checkStopImmediatePropagationEl) return;

	let divVar = window.checkStopImmedPropagationRealClickVarDiv;

	if (pars[0] === true || divVar == 1) {
		_fail(checkStopImmediatePropagationEl, 'It failed to stop-immediate-propagation and ran the class event on the same element.');
	} else {
		_addSuccessClass(checkStopImmediatePropagationEl);
	}
}
