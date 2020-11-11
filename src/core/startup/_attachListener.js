const _attachListener = (obj, ev, reGenEvent=false, isShadow=false) => {
	let opts = { capture: true };
	if (doesPassive) {
		if (nonPassiveEvents[ev] === true ||
				passiveEvents === false ||
				isShadow
			) {
			opts.passive = false;
		} else {
			opts.passive = true;
		}
	}
	if (doesPassive && reGenEvent) {
		// We are interested in a change from a passive to a non-passive from the addition of a prevent-default now being added to the config.
		// Any duplicate events added will get disregarded by the browser. This only happens in the document scope and for a document/component blend.
		// The reason for it not being more specific is that it's not worth the performance hit, being all about performance anyway and not functionality.
		// It could be made more specific later on if anyone complains. But it will need an actual real complaint before it's worth doing.
		obj.removeEventListener(ev, ActiveCSS._theEventFunction, { capture: true });
	}
	obj.addEventListener(ev, ActiveCSS._theEventFunction, opts);

};

// Keep this in here. The only reason it needs to be scoped to the root of Active CSS is because we need to remove an identical event listener, and we can only
// do that if a real function is used and is scoped higher up.
ActiveCSS._theEventFunction = e => {
	let ev = e.type;
	let component = e.target._acssComponent;
	let compDoc = (e.target instanceof ShadowRoot) ? e.target : null;
	let compRef = e.target._acssCompRef;
	if (!setupEnded) return;	// Wait for the config to fully load before any events start.
	let fsDet = _fullscreenDetails();
	switch (ev) {
		case 'click':
			if (!e.ctrlKey && !e.metaKey) {	// Allow default behaviour if control/meta key is used.
				_mainEventLoop('click', e, component, compDoc, compRef);
			}
			break;

		case 'keyup':
		case 'keydown':
			// A second Active CSS event is going to fire here to check if there is a specific key event.
			let ctrlCheck = (e.ctrlKey) ? 'Ctrl' : '';
			let metaCheck = (e.metaKey) ? 'Meta' : '';
			let shiftCheck = (e.shiftKey) ? 'Shift' : '';
			let funcKey = e.key;
			switch (e.key) {
				case ':': funcKey = 'Colon'; shiftCheck = ''; break;
				case ';': funcKey = 'Semicolon'; shiftCheck = ''; break;
				case '{': funcKey = 'OpenCurly'; shiftCheck = ''; break;
				case '}': funcKey = 'CloseCurly'; shiftCheck = ''; break;
				case '"': funcKey = 'DoubleQuotes'; shiftCheck = ''; break;
				case "'": funcKey = 'SingleQuote'; shiftCheck = ''; break;
				case '?': funcKey = 'Question'; shiftCheck = ''; break;
				case '!': funcKey = 'Exclamation'; shiftCheck = ''; break;
			}
			_mainEventLoop(ev + metaCheck + ctrlCheck + shiftCheck + funcKey, e, component, compDoc, compRef);
			_mainEventLoop(ev, e, component, compDoc, compRef);
			break;

		case fsDet[1] + 'fullscreenchange':
			_mainEventLoop(ev, e, component, compDoc, compRef);
			if (fsDet[0]) {
				_mainEventLoop('fullscreenEnter', e, component, compDoc, compRef);
			} else {
				_mainEventLoop('fullscreenExit', e, component, compDoc, compRef);
			}
			break;

		default:
			_mainEventLoop(ev, e, component, compDoc, compRef);
	}
};
