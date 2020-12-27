function checkFormEls() {
	let regularField = _getObj('#checkFormRegularField');
	let firstMimicField = _getObj('#checkFormMimicField1');
	let secondMimicField = _getObj('#checkFormMimicField2');
	let firstResultField = _getObj('#checkFormResultOfMimic1');
	let secondResultField = _getObj('#checkFormResultOfMimic2');
	let pageTitleMimicField = _getObj('#checkFormPageTitle');
	if (!regularField || !firstMimicField || !secondMimicField || !firstResultField || !secondResultField || !pageTitleMimicField) {
		_fail(testEl, 'Fields have not been drawn for testing. Form HTML for #checkFormForm:', _getObj('#checkFormForm').innerHTML);
	}
	return {
		regularField: regularField.value,
		firstMimicField: firstMimicField.value,
		secondMimicField: secondMimicField.value,
		firstResultField: firstResultField.innerHTML,
		secondResultField: secondResultField.innerHTML,
		pageTitle: document.title
	};
}

function checkFormResetA(o) {
	let checkFormResetEl = _initTest('checkFormReset');
	if (!checkFormResetEl) return;

	let els = checkFormEls();

	if (els.regularField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormRegularField is not "changedResult" on the change');
	}
	if (els.firstMimicField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormMimicField1 is not "changedResult" on the change');
	}
	if (els.secondMimicField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormMimicField2 is not "changedResult" on the change');
	}
	if (els.firstResultField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic1 is not "changedResult" on the change');
	}
	if (els.secondResultField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic2 is not "changedResult" on the change');
	}
	if (els.pageTitle !== 'New page title') {
		_fail(checkFormResetEl, 'document.title is not "New page title" on the change');
	}
}

function checkFormResetFinal(o) {
	let checkFormResetEl = _initTest('checkFormReset');
	if (!checkFormResetEl) return;

	let els = checkFormEls();

	if (els.regularField !== 'Bert') {
		_fail(checkFormResetEl, '#checkFormRegularField is not "Bert" on the reset');
	}
	if (els.firstMimicField !== 'Cheryl') {
		_fail(checkFormResetEl, '#checkFormMimicField1 is not "Cheryl" on the reset');
	}
	if (els.secondMimicField !== 'Bob') {
		_fail(checkFormResetEl, '#checkFormMimicField2 is not "Bob" on the reset');
	}
	if (els.firstResultField !== 'Cheryl') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic1 is not "Cheryl" on the reset');
	}
	if (els.secondResultField !== 'Bob') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic2 is not "Bob" on the reset');
	}
	if (els.pageTitle !== 'cheeseyness') {
		_fail(checkFormResetEl, 'document.title is not "cheeseyness" on the reset');
	}

	_addSuccessClass(checkFormResetEl);
}
