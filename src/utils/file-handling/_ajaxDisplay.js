/**
 * Handles what happens after the successful XHR request callback.
 *
 * Called by:
 *	_ajaxCallbackDisplay()
 *
 * Side-effects:
 *	Adjusts document.location.hash if appropriate
 *	Runs the appropriate afterAjax event
 *	Restarts the sync queue after an await or pause
 *	Triggers any hash event redrawing
 *	Resets the internally global hashEventAjaxDelay variables which detected if a hash event needed to be run or not
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxDisplay = o => {
	let ev = 'afterAjax' + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	_handleEvents({ obj: o.obj, evType: ev, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
	if (o.hash !== '') {
		document.location.hash = '';	// Needed as Chrome doesn't work without it.
		document.location.hash = o.hash;
	}
	if (hashEventAjaxDelay) {
		// Run any delayed hash on the URL events that need running after an ajax call has loaded or is ready for the display.
		hashEventAjaxDelay = false;
		_trigHashState(o.e);
	}
	// Restart the sync queue if await was used.
	_syncRestart(o, o._subEvCo);
};
