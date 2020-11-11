const _mainEventLoop = (typ, e, component, compDoc, compRef) => {
	if (e.target.id == 'cause-js-elements-ext') return;	// Internally triggered by extension to get bubble state. Don't run anything.
	let el;
	let bod = (e.target == self || e.target.body);
	if (typ != 'click' && bod) {
		// Run any events on the body, followed by the window.
		_handleEvents({ obj: 'body', evType: typ, eve: e });
		_handleEvents({ obj: 'window', evType: typ, eve: e });
		return;
	} else if (e.primSel) {
		el = e.secSelObj;
	} else {
		if (typ == 'click' && e.button !== 0) return;		// We only want the left button.
		el = e.target;	// Take in the object if called direct, or the event.
	}
	if (typ == 'mouseover' && !bod) {
		if (el.tagName == 'A' && el['data-active-nav'] !== 1) {
			// Set up any attributes needed for navigation from the routing declaration if this is being used.
			_setUpNavAttrs(el);
		}
	}

	if (typ == 'click' && e.primSel != 'bypass') {
		// Check if there are any click-away events set.
		// true above here means just check, don't run.
		if (clickOutsideSet && !_handleClickOutside(el)) {
			if (!e.primSel) {
				e.preventDefault();
			}
			return false;
		}
	}

	let composedPath;

	composedPath = _composedPath(e);
	// Certain rules apply when handling events on the shadow DOM. This is important to grasp, as we need to reverse the order in which they happen so we get
	// natural bubbling, as Active CSS by default uses "capture", which goes down and then we manually go up. This doesn't work when using shadow DOMs, so we have
	// to get a bit creative with the handling. Event listeners occur in the order of registration, which will always give us a bubble down effect, so we have to
	// do a manual bubble up and skip the first events if they are not related to the document or shadow DOM of the real target.
	let realItem = composedPath[0];
	if (_getRootNode(realItem).isSameNode(document) || e.target.isSameNode(realItem)) {
		// We do not run parent events of shadow DOM nodes - we only process the final events that run on the actual target, and then bubble up through
		// composedPath(). *Fully* cloning the event object (with preventDefault() still functional) is not currently supported in browsers, understandably, so
		// re-ordering of real events is not possible, so we have to skip these. The reason being that preventDefault will break on events that have already bubbled,
		// and cloning and running an event object later on means that any bubbling will happen before the re-run, thus rendering preventDefault() unusable, and we
		// do still need it for cancelling browser behaviour. So therefore preventDefault() will correctly fatally error if cloned and re-used. [edit] Possibly could have
		// created a new event, but that may have led us into different problems - like unwanted effects outside of the Active CSS flow.
		let compDetails;
		for (el of composedPath) {
			if (el.nodeType !== 1) continue;
			// This could be an object that wasn't from a loop. Handle any ID or class events.
			if (typ == 'click' && el.tagName == 'A' && el['data-active-nav'] !== 1) {
				// Set up any attributes needed for navigation from the routing declaration if this is being used.
				_setUpNavAttrs(el);
			}
			// Is this in the document root or a shadow DOM root?
			compDetails = _componentDetails(el);
			_handleEvents({ obj: el, evType: typ, eve: e, component: compDetails.component, compDoc: compDetails.compDoc, compRef: compDetails.compRef });
			if (!el || !e.bubbles || el.tagName == 'BODY' || el.activeStopProp) break;		// el can be deleted during the handleEvent.
		}
		if (el && el.activeStopProp) {
			el.activeStopProp = false;
		} else {
			if (document.parentNode) _handleEvents({ obj: window.frameElement, evType: typ, eve: e });
		}
	}
};
