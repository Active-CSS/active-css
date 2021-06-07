_a.LoadScript = (o, opt) => {
	let scr = o.actVal._ACSSRepQuo();
	// If this is a stylesheet and it's been placed into a shadow DOM then make it unique so it can be loaded in multiple shadow DOMs.
	let forShadow = (supportsShadow && o.compDoc instanceof ShadowRoot);
	let storeRef = (opt == 'style' && forShadow) ? o.varScope + '|' : '';
	let trimmedURL = storeRef + _getBaseURL(scr);
	if (!scriptTrack.includes(trimmedURL)) {
		let typ = (opt == 'style') ? 'link' : 'script';
		let srcTag = (opt == 'style') ? 'href' : 'src';
		let scrip = document.createElement(typ);
		if (opt == 'style') {
			scrip.rel = 'stylesheet';
		}
		scrip[srcTag] = scr;
		let afterEvent = 'afterLoad' + ((opt == 'style') ? 'Style' : 'Script');
		scrip.onload = function() {
			// Run the after event for this command if successful.
			_handleEvents({ obj: o.obj, evType: afterEvent, eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
		};
		scrip.onerror = function() {
			// Wipe any existing action commands after await, if await was used.
			_syncEmpty(o._subEvCo);
			// Call the general error callback event for this command.
			_handleEvents({ obj: o.obj, evType: afterEvent + 'Error', eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		};
		if (forShadow) {
			o.compDoc.appendChild(scrip);
		} else {
			document.head.appendChild(scrip);
		}
		scriptTrack.push(trimmedURL);
	}
};
