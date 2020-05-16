const _setupEvent = (ev, sel, component) => {
	if (typeof selectors[ev] === 'undefined') {
		selectors[ev] = [];
	}
	// We are giving the main navig keys events, as they are commonly used in UI. Prefixed by keyup 
	if (selectors[ev].includes(sel)) {
		if (!setupEnded || !doesPassive) {
			return;
		}
		// Let it through - this could be a load-config with a prevent-default now changing the passive "true" state to false. We need to replace the event listener.
		// This will only happen on a document level - not a shadow DOM level. Events in the shadow DOM can only be added when it is created - _attachListener() is
		// called directly from _renderShadowDomsDo().
	} else {
		selectors[ev].push(sel);
	}
	if (debuggerEvs.includes(ev)) {
		if (!setupEnded || !doesPassive) {
			return;
		}
		// Let it through.
	} else {
		debuggerEvs.push(ev);	// Push the event onto the debugger event list.
	}
	ev = _getRealEvent(ev);
	if (ev === false) return;
	if (setupEnded || !eventState[ev]) {
		// We could store a variable tracking before passive states of already set up events, rather than running this on every load-config for all new events.
		// This isn't set up yet though. It would need check the before passive status of an event, and if it is not false - run this - otherwise skip it. It's
		// a micro-optimizing point - slap it on the list. It's not an initial load time speed change though - that won't be further optimized by that change,
		// only later load-config actions, which as I said, are more than likely to contain less events than the main config. Unless the person is lazy-loading
		// everything because they already have a slow page. In that case a few microseconds extra won't make a difference particularly. So it's micro-optimization.
		// It might not even be worth it.
		let obj = (document.parentNode && sel == 'body' && ev == 'scroll') ? document.body : window;
		let reGenEvent = (setupEnded) ? true : false;	// We need this, because of the dynamic shadow DOM event adding, which always happens after setup but is actually not a regeneration of an event.
		_attachListener(obj, ev, null, null, null, reGenEvent);
		eventState[ev] = true;
	}
};
