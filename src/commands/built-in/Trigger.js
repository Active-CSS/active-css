_a.Trigger = o => {
/*	I'm pretty sure this isn't needed any more. Leave it here for the moment, as if put back it will need changing to secsel.
	if (typeof o.obj === 'string' && o.obj.indexOf('{@') === -1 && o.obj.indexOf('{$') === -1 && !['~', '|'].includes(o.obj.substr(0, 1))) {
		// This is a string, and we need the real objects, so do a queryselectorall.
		o.doc.querySelectorAll(o.obj).forEach(function (obj, i) {
			if (['~'].includes(o.secSel.substr(0,1))) {
				// This is a trigger on a custom selector. Pass the available objects in case they are needed.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, origObj: obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
			} else {
				// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, compRef: o.compRef, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
			}
		});
	} else {
*/
		if (typeof o.secSel == 'string' && ['~'].includes(o.secSel.substr(0, 1))) {
			// This is a trigger on a custom selector. Pass the available objects in case they are needed.
			_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, origObj: o.obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
		} else {
			// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
			// Is this a draw event? If so, we also want to run all draw events for elements within.
			if (o.actVal == 'draw') {
				_runInnerEvent(o, null, 'draw');
			} else {
				_handleEvents({ obj: o.secSelObj, evType: o.actVal, otherObj: o.ajaxObj, eve: o.e, compRef: o.compRef, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
			}
		}
//	}
};
