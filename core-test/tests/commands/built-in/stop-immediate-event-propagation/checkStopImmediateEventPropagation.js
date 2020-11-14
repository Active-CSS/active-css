function checkStopImmediateEventPropagation(o, pars) {
	let testEl = _initTest('checkStopImmediateEventPropagation');
	if (!testEl) return;

	console.log();
	if (pars[0] === true) {
		_fail(testEl, 'It failed to stop immediate propagation and ran the following class event on the same element.');
	} else {
		_addSuccessClass(testEl);
	}
}
