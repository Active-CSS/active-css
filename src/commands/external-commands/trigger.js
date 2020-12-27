ActiveCSS.trigger = (sel, ev, varScope, compDoc, component, evScope) => {
	/* API command */
	/* Possibilities:
	ActiveCSS.trigger('~restoreAfterTinyMCE', 'custom');		// Useful for calling random events.
	ActiveCSS.trigger(o.obj, 'customCancel');	// Useful for external function to call a custom event on the initiating object.

	// This needs to be expanded to include ajaxobj, e and obj, so an after trigger can continue. FIXME at some point.
	*/
	// Subject to conditionals.
	if (typeof sel == 'object') {
		// This is an object that was passed.
		_handleEvents({ obj: sel, evType: ev, varScope: varScope, evScope: evScope, compDoc: compDoc, component: component });
	} else {
		_a.Trigger({ secSel: sel, actVal: ev, varScope: varScope, evScope: evScope, compDoc: compDoc, component: component });
	}
};
