_a.Trigger = o => {
	if (typeof o.obj === 'string' && o.obj.indexOf('{@') === -1 && o.obj.indexOf('{$') === -1 && !['~', '|'].includes(o.obj.substr(0, 1))) {
		// This is a string, and we need the real objects, so do a queryselectorall.
		o.doc.querySelectorAll(o.obj).forEach(function (obj, i) {
			if (['~'].includes(o.secSel.substr(0,1))) {
				// This is a trigger on a custom selector. Pass the available objects in case they are needed.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), origObj: obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			} else {
				// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
				_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			}
		});
	} else {
		if (['~'].includes(o.secSel.substr(0, 1))) {
			// This is a trigger on a custom selector. Pass the available objects in case they are needed.
			_handleEvents({ obj: o.secSel, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), origObj: (o.obj || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		} else {
			// Note: We want to keep the object of the selector, but we do still want the ajaxObj.
			// Is this a draw event? If so, we also want to run all draw events for elements within.
			if (o.actVal == 'draw') {
				_runInnerEvent(o.secSelObj, 'draw');
			} else {
				_handleEvents({ obj: o.secSelObj, evType: o.actVal, otherObj: (o.ajaxObj || null), eve: (o.e || null), compRef: o.compRef, compDoc: o.compDoc, component: o.component });
			}
		}
	}
};
