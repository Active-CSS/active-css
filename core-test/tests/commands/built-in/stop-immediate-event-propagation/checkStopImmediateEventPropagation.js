function checkStopImmediateEventPropagation(o, pars) {
	let checkStopImmediateEventPropagationEl = _initTest('checkStopImmediateEventPropagation');
	if (!checkStopImmediateEventPropagationEl) return;

	if (pars[0] === true) {
		_fail(checkStopImmediateEventPropagationEl, 'It failed to stop-immediate-event-propagation and ran the class event on the same element.');
	} else {
		_addSuccessClass(checkStopImmediateEventPropagationEl);
	}
}
