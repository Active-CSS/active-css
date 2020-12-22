_a.Trigger = o => {
	if (typeof o.secSel == 'string' && o.secSel.substr(0, 1) == '~') {
		// This is a trigger on a custom selector. Pass the available objects in case they are needed.
		_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, origObj: o.obj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
	} else {
		// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
		// Is this a draw event? If so, we also want to run all draw events for elements within.
		if (o.actVal == 'draw') {
			_runInnerEvent(o, null, 'draw');
		} else if (o.secSel == 'body' || o.secSel == 'window') {
			// Run any events on the body, followed by the window.
			_handleEvents({ obj: 'body', evType: o.actVal });
			_handleEvents({ obj: 'window', evType: o.actVal });
		} else {
			_handleEvents({ obj: o.secSelObj, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
		}
	}
};
