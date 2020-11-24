function checkStopEventPropagation(o, pars) {
	let checkStopEventPropagationEl = _initTest('checkStopEventPropagation');
	if (!checkStopEventPropagationEl) return;

	if (pars[0] !== 1 || pars[1] !== 1) {
		_fail(checkStopEventPropagationEl, 'It failed to handle stop-event-propagation correctly. pars[0]:', pars[0], 'pars[1]:', pars[1]);
	} else {
		_addSuccessClass(checkStopEventPropagationEl);
	}

	_addSuccessClass(checkStopEventPropagationEl);
}
