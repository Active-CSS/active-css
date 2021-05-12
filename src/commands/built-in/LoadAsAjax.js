_a.LoadAsAjax = o => {
	let el = document.querySelector(o.actVal);
	if (!el) {
		let pageContents = '<p>Active CSS Error: could not find template (' + o.actVal + ').</p>';
	} else {
		if (typeof o.secSelObj == 'object') {
			// This is an object that was passed.
			o.res = el.innerHTML;
			o.res = _escapeInline(o.res, 'script');
			o.res = _escapeInline(o.res, 'style type="text/acss"');
			_setHTMLVars({res: o.res});
			_handleEvents({ obj: o.obj, evType: 'afterLoadAsAjax', eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
		}
	}

};
