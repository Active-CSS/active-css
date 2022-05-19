/**
 * Handles error after XHR request.
 *
 * Called by:
 *	_ajaxCallback()
 *
 * Side-effects:
 *	Adjusts properties in action flow object.
 *	Empties asynchronous reference store (for resumption after await or pausing).
 *	Runs specific afterAjax... error event.
 *	Runs general afterAjax...Error event.
 *	Send debug data to the extension.
 *	Adjusts internally global preGetting variable to remove preGet state of URL.
 *
 * @private
 * @param {String} str: Unused in this function, but it needs to exist as the first parameter for browser XHR error callback.
 * @param {String} resp: The XHR response code (404, etc.)
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallbackErr = (str, resp, o) => {
	o.error = true;
	o.errorCode = resp || '';

	// Wipe any existing action commands after await, if await was used.
	_syncEmpty(o._subEvCo);

	// Handle error code event.
	let generalEvent = 'afterAjax' + ((o.preGet) ? 'PreGet' : '') + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');

	// This handles an ajax error from a rendered component importing a file.
	let objToUse, isComponent;
	if (!o.obj && o.renderObj && o.renderObj.renderO && o.renderObj.renderO.evObj) {
		objToUse = o.renderObj.renderO.evObj.obj;
		isComponent = true;
		// The general failure event should only happen once per component. It is possible to have both html and css files failing, but we only want one event.
		// When a component has failed, the attribute data-ajax-failure gets added (lower down). That is used to track whether to run further error events.
		// If it isn't a component, we are not considered with any of that and just show the errors.
	} else {
		objToUse = o.obj;
	}

	if (!isComponent || !objToUse.hasAttribute('data-ajax-failure')) {
		let commonObj = { obj: objToUse, evType: generalEvent + o.errorCode, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo };
		if (o.errorCode) _handleEvents(commonObj);
		commonObj.evType = generalEvent + 'Error';

		// Handle general error event.
		_handleEvents(commonObj);
	}

	if (isComponent) {
		// The component is effectively rendered useless if there has been an ajax import failure, so we mark the element so the developer can remove it manually.
		// We do this rather than remove it automatically because it puts the control into the developer's hands and they can see the failure.
		objToUse.setAttribute('data-ajax-failure', resp);
	}

	if (!o.preGet) {
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax callback error debug: failed with error "' + resp + '".');
		}
	} else {
		delete preGetting[o.finalURL];
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax-pre-get callback error debug: failed with error "' + resp + '".');
		}
	}
};
