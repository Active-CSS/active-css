// This needs to be setup here before Active CSS starts up for a valid test.
window.checkStopPropagationRealClickVarDiv = 0;

document.body.addEventListener('click', function (e) {
	let stopPropEl = _getObj('#checkStopPropagationDiv');
	if (stopPropEl && e.target == stopPropEl) {
		window.checkStopPropagationRealClickVarDiv = 1;
	}
}, { capture: true });

function checkStopPropagation(o, pars) {
	let checkStopPropagationEl = _initTest('checkStopPropagation');
	if (!checkStopPropagationEl) return;

	let divVar = window.checkStopPropagationRealClickVarDiv;

	if (pars[0] !== 1 || pars[1] !== 1 || divVar === 1) {
		_fail(checkStopPropagationEl, 'It failed to handle stop-propagation correctly. pars[0]:', pars[0], 'pars[1]:', pars[1], 'divVar:', divVar);
	} else {
		_addSuccessClass(checkStopPropagationEl);
	}
}
