const _placeCaretAtEnd = el => {
	// Assumes el is already in focus. Only works with input fields for the moment.
	if (el.selectionStart || el.selectionStart === 0) {
		el.selectionStart = el.value.length;
		el.selectionEnd = el.value.length;
		el.blur();
	}
	el.focus();
};
