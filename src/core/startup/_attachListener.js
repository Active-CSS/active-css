const _attachListener = (obj, ev, component, shadowDoc, shadowRef, reGenEvent=false) => {
	let opts = { capture: true };
	if (doesPassive) {
		let componentRef = !component ? 'doc' : component;
		if (nonPassiveEvents[componentRef] !== undefined &&
				nonPassiveEvents[componentRef][ev] !== undefined &&
				nonPassiveEvents[componentRef][ev] === true ||
				passiveEvents === false
			) {
			opts.passive = false;
		} else {
			opts.passive = true;
		}
	}
	if (doesPassive && reGenEvent) {
		// We are interested in a change from a passive to a non-passive from the addition of a prevent-default now being added to the config.
		// Any duplicate events added will get disregarded by the browser.
		obj.removeEventListener(ev, ActiveCSS._theEventFunction, { capture: true });
		// Clean up.
		delete obj['_acss' + ev + 'EvComponent'];
		delete obj['_acss' + ev + 'EvShadowDoc'];
		delete obj['_acss' + ev + 'EvShadowRef'];
		
	}
	// JavaScript is very particular when it comes to removing event listeners. A bit too particular for my liking. Curried functions with pars don't seem to work.
	obj['_acss' + ev + 'EvComponent'] = component;
	obj['_acss' + ev + 'EvShadowDoc'] = shadowDoc;
	obj['_acss' + ev + 'EvShadowRef'] = shadowRef;
	obj.addEventListener(ev, ActiveCSS._theEventFunction, opts);

};

// Keep this in here. The only reason it needs to be scoped to the root of Active CSS is because we need to remove an identical event listener, and we can only
// do that if a real function is used and is scoped higher up.
ActiveCSS._theEventFunction = e => {
	let ev = e.type;
	let component = e.target['_acss' + ev + 'EvComponent'];
	let shadowDoc = e.target['_acss' + ev + 'EvShadowDoc'];
	let shadowRef = e.target['_acss' + ev + 'EvShadowRef'];
	if (!setupEnded) return;	// Wait for the config to fully load before any events start.
	let fsDet = _fullscreenDetails();
	switch (ev) {
		case 'click':
			if (!e.ctrlKey) {	// Allow default behaviour if control key is used.
				_mainEventLoop('click', e, component, shadowDoc, shadowRef);
			}
			break;

		case 'keyup':
		case 'keydown':
			// A second Active CSS event is going to fire here to check if there is a specific key event.
			let ctrlCheck = (e.ctrlKey) ? 'Ctrl' : '';
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
			_mainEventLoop(ev + ctrlCheck + shiftCheck + funcKey, e, component, shadowDoc, shadowRef);
			_mainEventLoop(ev, e, component, shadowDoc, shadowRef);
			break;

		case fsDet[1] + 'fullscreenchange':
			_mainEventLoop(ev, e, component, shadowDoc, shadowRef);
			if (fsDet[0]) {
				_mainEventLoop('fullscreenEnter', e, component, shadowDoc, shadowRef);
			} else {
				_mainEventLoop('fullscreenExit', e, component, shadowDoc, shadowRef);
			}
			break;

		default:
			_mainEventLoop(ev, e, component, shadowDoc, shadowRef);
	}
};
