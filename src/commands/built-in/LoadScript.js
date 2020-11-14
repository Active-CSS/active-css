_a.LoadScript = (o, opt) => {
	let scr = o.actVal._ACSSRepQuo();
	// If this is a stylesheet and it's been placed into a shadow DOM then make it unique so it can be loaded in multiple shadow DOMs.
	let forShadow = (supportsShadow && o.compDoc instanceof ShadowRoot);
	let storeRef = (opt == 'style' && forShadow) ? o.compRef + '|' : '';
	let trimmedURL = storeRef + _getBaseURL(scr);
	if (!scriptTrack.includes(trimmedURL)) {
		let typ = (opt == 'style') ? 'link' : 'script';
		let srcTag = (opt == 'style') ? 'href' : 'src';
		let scrip = document.createElement(typ);
		if (opt == 'style') {
			scrip.rel = 'stylesheet';
		}
		scrip[srcTag] = scr;
		scrip.onload = function() {
			_handleEvents({ obj: o.obj, evType: 'afterLoad' + ((opt == 'style') ? 'Style' : 'Script'), eve: o.e, compRef: o.compRef, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
		};
		if (forShadow) {
			o.compDoc.appendChild(scrip);
		} else {
			document.head.appendChild(scrip);
		}
		scriptTrack.push(trimmedURL);
	}
};
