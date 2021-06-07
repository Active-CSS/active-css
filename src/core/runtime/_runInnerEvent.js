const _runInnerEvent = (o, sel, ev, doc=document, initialization=false) => {
	let noDrawTwiceCheck = (ev == 'draw' && initialization);	// If new elements get added during body:init, then it's possible draw events can happen on the same thing twice, hence this line.
	o = o || {};
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			if (!obj._acssDrawn || !noDrawTwiceCheck) _handleEvents({ obj: obj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		});
	} else {
		// This is a draw trigger on an element, which should include its contents.
		_handleEvents({ obj: o.secSelObj, evType: ev, primSel: o.primSel, origO: o, otherObj: o.ajaxObj, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		_runInnerEvent(o, '*:not(template *)', ev, o.secSelObj);
	}
};
