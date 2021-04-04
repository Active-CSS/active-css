const _ajaxCallbackDisplay = (o) => {
	if (!o.error && (o.cache || o.preGet)) {
		// Store it for later. May need it in the afterAjaxPreGet event if it is run.
		ajaxResLocations[o.finalURL] = o.res;
	}
	if (o.preGet) {
		delete preGetting[o.finalURL];
	}
	if (!o.error && o.preGet) {
		// Run the afterAjaxPreGet event.
		_handleEvents({ obj: o.obj, evType: 'afterAjaxPreGet' + ((o.error) ? o.errorCode : ''), eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
	} else {
		// Run the post event - success or failure.
		_ajaxDisplay(o);
	}
};
