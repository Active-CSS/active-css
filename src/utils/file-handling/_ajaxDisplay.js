const _ajaxDisplay = o => {
	let ev = 'afterAjax' + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	if (o.error) ev += o.errorCode;
	_handleEvents({ obj: o.obj, evType: ev, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
	if (o.hash !== '') {
		document.location.hash = '';	// Needed as Chrome doesn't work without it.
		document.location.hash = o.hash;
	}
	if (hashEventAjaxDelay) {
		// Run any delayed hash on the URL events that need running after an ajax call has loaded or is ready for the display.
		hashEventAjaxDelay = false;
		_trigHashState(o.e);
	}
};
