const _getRealEvent = ev => {
	let first5 = ev.substr(0, 5);
	if (first5 == 'after' && ev != 'afterprint') {	// This is a Active CSS only event, so we don't want to add an event listener.
		return false;
	} else if (first5 == 'keyup') {
		ev = 'keyup';
	} else if (ev.substr(0, 7) == 'keydown') {
		ev = 'keydown';
	} else if (ev == 'fullscreenEnter' || ev == 'fullscreenExit') {		// Active CSS only events.
		ev = _fullscreenDetails()[1] + 'fullscreenchange';		// Active CSS only events.
	} else {
		if (['draw', 'disconnectCallback', 'adoptedCallback', 'attributeChangedCallback', 'beforeShadowOpen', 'shadowOpen'].includes(ev)) return false;	// custom Active CSS events.
		if (ev.substr(0, 12) == 'attrChanges-') return false;	// custom Active CSS event attrChange-(attrname). We need to do this to avoid clash with custom event names by user.
	}
	return ev;
};
