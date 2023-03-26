ActiveCSS.triggerFresh = (sel, ev) => {
	/* API command */
	setTimeout(() => {
		let compDetails = (sel.hasAttribute('data-active-scoped')) ? _getComponentDetails(sel) : _componentDetails(sel);
		_handleEvents({ obj: sel, evType: ev, varScope: compDetails.varScope, evScope: compDetails.evScope, compDoc: compDetails.compDoc, component: compDetails.component });
	}, 0);
};
