ActiveCSS._formatConditional = sel => {
	// The string conds could be multiple conditionals. We want to check each one and format the whole string here to send back.
	// First, split the selector up by colon.
	let arr = sel.split(':');
	let condLen = arr.length;
	let i;
	let str = arr[0];
	for (i = 1; i < condLen; i++) {		// Start from the second one. A conditional should never be in the first item - that would be an error.
		if (arr[i].trim() === '') continue;
		str += ':';
		str += (conditionals[arr[i]]) ? '<span class="active-event-cond-inline">' + arr[i] + '</span>' : arr[i];
	}
	return str;
};
