const _handleObserveEvents = (mutations, dom, justCustomSelectors=false) => {
	// This can get called a lot of times in the same event stack, and we only need to do once per criteria, so process a queue.
	if (!dom) dom = document;          // Don't move this into parameter default.
 
	// This can get called a lot of times, so process a queue and don't queue duplicate calls back into this function.
	// _handleEvents, which is used in here, can generate more calls back into this function, which is necessary, but not if we already have the same
	// thing already queued.
	// The key to this is to remember that we do process this function if dom + justCustomSelectors is a unique entry for this queue.
	// observeEventsQueue and observeEventsMid are objects so that states can be deleted cleanly when ended with minimal fuss.
/*            comment out for the moment - seems to be a loop going on sometimes.
	let ref, skipQueue;
	if (dom.nodeType == 9) {
		// This is the document.
		ref = 'doc' + justCustomSelectors;
	} else {
		// This is a document fragment.
		let domFirstChild = dom.firstChild;
		if (domFirstChild) {
			if (domFirstChild === Node.TEXT_NODE) return; // If the document only has a text node then it's not a valid document for ACSS. Skip observe events.
			ref = (domFirstChild._acssActiveID) ? dom.firstChild._acssActiveID : _getActiveID(dom.firstChild).substr(3);
		} else {
			// It shouldn't really get in here, but if it does due to an empty component, just skip the queueing and run.
			skipQueue = true;
		}
	}
 
	if (!skipQueue) {
		if (observeEventsQueue[ref]) return;	       // Already queued to the end of the event stack - skip.
		if (observeEventsMid[ref]) {
			observeEventsQueue[ref] = true;
			setTimeout(() => {
				delete observeEventsQueue[ref];
				_handleObserveEvents(mutations, dom, justCustomSelectors);
			}, 0);
		}
		observeEventsMid[ref] = true;
	}
*/

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
 
//            if (!skipQueue) delete observeEventsMid[ref];
};
