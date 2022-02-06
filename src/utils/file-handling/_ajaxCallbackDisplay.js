/**
 * Handles display after XHR request.
 *
 * Called by:
 *	_resolveAjaxVars()
 *	_ajaxCallback()
 *
 * Side-effects:
 *	Adjusts internally global ajaxResLocations variable to store URL if caching or pre-getting.
 *	Adjusts internally global preGetting variable to remove preGet state of URL.
 *	Runs the afterAjaxPreGet event if appropriate.
 *	Calls _ajaxDisplay which handles success or failure.
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallbackDisplay = (o) => {
	if (!o.error && (o.cache || o.preGet)) {
		// Store it for later. May need it in the afterAjaxPreGet event if it is run.
		ajaxResLocations[o.finalURL] = o.res;
	}
	if (o.preGet) {
		delete preGetting[o.finalURL];
	}
	if (o.renderComp) {
		// This has been called as an option for component rendering. Remove the pending class for this component and call _renderCompDoms again.
		let { renderO, typ, obj, compName, compDoc, childTree, numTopNodesInRender, numTopElementsInRender } = o.renderObj;
		obj.classList.remove(typ + 'Pending');
		let ref = obj.getAttribute('data-ref');
		if (compPending[ref] === undefined) compPending[ref] = '';
		compPending[ref] += (compPending[ref] != '' ? "\n" : '' ) + (typ == 'css' ? '<style>' + o.res + '</style>' : o.res);

		// Are we ready to render yet? The answer is that we are not ready if we are still waiting for further ajax requests. This callback will be called again later.
		if (_isPendingAjaxForComponents(obj)) return;

		_renderCompDoms(renderO, compDoc, childTree, numTopNodesInRender, numTopElementsInRender);
	} else {
		if (!o.error && o.preGet) {
			// Run the afterAjaxPreGet event.
			_handleEvents({ obj: o.obj, evType: 'afterAjaxPreGet', eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		} else {
			// Run the post event - success or failure.
			_ajaxDisplay(o);
		}
	}
};
