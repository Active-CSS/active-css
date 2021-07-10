_a.Trigger = o => {
	let oClone = _clone(o);

	if (typeof o.secSel == 'string' && o.secSel.indexOf('~') !== -1) {
		// Remove any attached scopes prior to handling the event - probably custom event came from a sub-component. The event handling adds the scopes on as indicated.
		let colonPos = o.secSel.indexOf(':');
		let unScopedSecSel = (colonPos !== -1) ? o.secSel.substr(colonPos + 1) : o.secSel;
		// This is a trigger on a custom selector. Pass the available objects in case they are needed.
		_handleEvents({ obj: unScopedSecSel, evType: oClone.actVal, primSel: oClone.primSel, origO: oClone, otherObj: oClone.ajaxObj, eve: o.e, origObj: oClone.obj, varScope: oClone.varScope, evScope: oClone.evScope, compDoc: oClone.compDoc, component: oClone.component, _maEvCo: oClone._maEvCo });
	} else {
		// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
		// Is this a draw event? If so, we also want to run all draw events for elements within.
		if (o.actVal == 'draw') {
			_runInnerEvent(o, o.secSelObj, 'draw');
		} else if (o.origSecSel == 'body' || o.origSecSel == 'window') {
			// Run any events on the body, followed by the window.
			_handleEvents({ obj: 'body', evType: oClone.actVal, origO: oClone, compDoc: document });
			let windowClone = _clone(o);
			_handleEvents({ obj: 'window', evType: windowClone.actVal, origO: windowClone, eve: o.e, compDoc: document });
		} else {
			_handleEvents({ obj: oClone.secSelObj, evType: oClone.actVal, primSel: oClone.primSel, origO: oClone, otherObj: oClone.ajaxObj, eve: o.e, varScope: oClone.varScope, evScope: oClone.evScope, compDoc: oClone.compDoc, component: oClone.component, _maEvCo: oClone._maEvCo });
		}
	}
};
