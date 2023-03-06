const _handleObserveEvents = (mutations, dom, justCustomSelectors=false) => {
	// This can get called a lot of times in the same event stack, and we only need to do once per criteria, so process a queue.
	if (!dom) dom = document;          // Don't move this into parameter default.
 
	// Handle cross-element observing for all observe events.
	let evType = 'observe', i, primSel, compSelCheckPos, testSel, compDetails;
	if (!selectors[evType]) return;
 
	// Loop observe events.
	let selectorListLen = selectors[evType].length;
	for (i = 0; i < selectorListLen; i++) {
		primSel = selectors[evType][i];
		compSelCheckPos = primSel.indexOf(':');
		testSel = primSel.substr(compSelCheckPos + 1);
		if (testSel.substr(0, 1) == '~') {
			// This is a custom selector.
			_handleEvents({ obj: testSel, evType });
		} else if (!justCustomSelectors) {
			let compDetails;
			let sel = (primSel.substr(0, 1) == '|') ? testSel : primSel;
 
			dom.querySelectorAll(sel).forEach(obj => {	            // jshint ignore:line
				// There are elements that match. Now we can run _handleEvents on each one to check the conditionals, etc.
				// We need to know the component details if there are any of this element for running the event so we stay in the context of the element.
				if (obj === document.body) {
					_handleEvents({ obj, evType });
				} else {
					compDetails = _componentDetails(obj);
					_handleEvents({ obj, evType, component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });
				}
			});
		}
	}
};
