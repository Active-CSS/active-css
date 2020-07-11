const _debugOutput = oCopy => {
	// Do some checks to put into oCopy at this point, so we don't have to come back.
//	oCopy.feedbackRes = [];	// this line errors with popstate event - when coming back to this code, sort it out.

/* Part of a future release. Delete if it gets too old.
	// Check the action function actually exists.
	if (typeof ActiveCSS[oCopy.func] !== 'function') {
		oCopy.feedbackRes.push('/w Action function "' + oCopy.actName + '" does not exist. Skipped');
	}
		
	if (typeof oCopy.secSel != 'object' && !['~', '|'].includes(oCopy.secSel.substr(0, 1))) {
		let checkThere = false, activeID;
		oCopy.doc.querySelectorAll(oCopy.secSel).forEach(function (obj, i) {
			activeID = _getActiveID(obj);
			// The node is there, it might have been cancelled though.
			checkThere = true;
			if (activeID && cancelIDArr[activeID] && cancelIDArr[activeID][oCopy.func]) {
				oCopy.feedbackRes.push('This action was cancelled with "cancel-timer", and did not occur.');
			}
		});
		if (!checkThere) {
			// If the object isn't there, we run it with the remembered object, as it could be from a popstate, but only if this is top-level action command.
			// Only by doing this can we ensure that this is an action which will only target elements that exist.
			if (oCopy.secSel.lastIndexOf('data-active-id') !== -1) {
				// This is probably ok.
			} else {
				oCopy.feedbackRes.push('The target "' + oCopy.secSel + '" is not on the page.');
			}
		}
	}
*/
	_sendMessage(oCopy, 'debugOutput', 'tracker');
};
