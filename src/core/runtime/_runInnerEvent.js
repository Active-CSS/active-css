const _runInnerEvent = (o, sel, ev, doc=document, initialization=false) => {
	let noDrawTwiceCheck = (ev == 'draw' && initialization);	// If new elements get added during body:init, then it's possible draw events can happen on the same thing twice, hence this line.
	o = o || {};
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			let evObj = { obj: obj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo };
			if (ev == 'draw') {
				if (!obj._acssDrawn || !noDrawTwiceCheck) {
					_handleDrawScope(evObj);
				}
			} else {
				_handleEvents(evObj);
			}
		});
	} else {
		// This is a trigger on an element, which should include its contents.
		let evObj = { obj: o.secSelObj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo };
		if (ev == 'draw' && (!o.secSelObj._acssDrawn || !noDrawTwiceCheck)) {	// don't handle scope again if it's already been drawn.
			_handleDrawScope(evObj);
		} else {
			_handleEvents(evObj);
		}
		_runInnerEvent(o, '*:not(template *)', ev, o.secSelObj);
	}
};
