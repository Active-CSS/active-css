_a.MimicIntoHtml = o => { _a.MimicInto(o, true); };

_a.MimicInto = (o, useHTML=false) => {
	if (!_isConnected(o.secSelObj)) return false;
	let el, mType, val, valRef, targEl;
	el = o.secSelObj;
	// Get some properties of the target.
	if (o.actVal == 'title') {
		targEl = 'title';
		mType = 'title';
		val = currDocTitle;
	} else {
		targEl = _getSel(o, o.actVal);
		if (!targEl) return;
		if (targEl.tagName == 'INPUT' || targEl.tagName == 'TEXTAREA') {
			mType = 'input';
		} else {
			mType = 'text';
		}
	}

	// Get the value reference of the mimicked obj.
	valRef = _getFieldValType(el);
	if (o.actVal != 'title') {
		val = el[valRef];
	}

	// Now mimic has started we need to set up a reset event which will automatically put the contents back into the
	// target areas if the form containing the fields gets reset. This should be automatic behaviour.
	// Get the form property, add the reset value and reference to an array property in the form.
	// When the form is reset, check for this property. If it exists, run a routine to display these original values.
	// Note: this is different to using clone and restore-clone on the target of the mimic.
	var counter = 0;
	var pref = '';
	var closestForm = o.secSelObj.form || o.secSelObj.closest('form');
	if (closestForm) {
		if (!closestForm.cjsReset) {
			closestForm.cjsReset = [];
			// Log a reset event for this form.
			closestForm.addEventListener('reset', _mimicReset);
		}
		// Check if the reset value is already in there. We don't want to overwrite it with the previous change if it is.
		if (mType == 'title') {
			if (!closestForm.cjsReset.title) {
				closestForm.cjsReset.title = el.getAttribute('value');	// Get the original value before change.
			}
		} else {
			if (!el.activeResetValueSet) {
				// Add the default of the input field before it is changed for resetting later on if needed.
				counter = closestForm.cjsReset.length;
				closestForm.cjsReset[counter] = {};
				closestForm.cjsReset[counter].el = targEl;
				closestForm.cjsReset[counter].value = val;
				closestForm.cjsReset[counter].type = mType;
				el.activeResetValueSet = true;
			}
		}
	}

	// Mimic the value.
	var insVal;
	if (useHTML) {
		insVal = o.secSelObj.innerHTML;
	} else {
		insVal = o.secSelObj[valRef];
	}
	switch (mType) {
		case 'input':
			targEl.value = insVal;
			break;
		case 'text':
			if (useHTML) {
				targEl.innerHTML = insVal;
			} else {
				targEl.innerText = insVal;
			}
			break;
		case 'title':
			_setDocTitle(insVal);
	}
};
