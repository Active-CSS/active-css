const _handleObserveEvents = (justCustomSelectors) => {
	// Handle cross-element observing on all observe events.
	let evType = 'observe', i, primSel, compSelCheckPos, testSel;
	if (!selectors[evType]) return;

	// Loop observe events.
	let selectorListLen = selectors[evType].length;

	for (i = 0; i < selectorListLen; i++) {
		primSel = selectors[evType][i];
		compSelCheckPos = primSel.indexOf(':');
		testSel = primSel.substr(compSelCheckPos + 1);
		if (testSel.substr(0, 1) === '~') {
			// Just check the conditionals on this custom selector.
			_handleEvents({ obj: testSel, evType: 'observe' });
			
		} else if (justCustomSelectors !== true) {	// justCustomSelectors can either be empty or the event object.
			let elsToCheck = document.querySelectorAll(primSel);
			if (!elsToCheck) return;
			// There are elements that match. Now we can run _handleEvents on each one to check the conditionals, etc.
			elsToCheck.forEach(function (obj) {
				_handleEvents({ obj, evType: 'observe' });
			});
		}
	}
};
