const _getBaseVar = str => {
	let dotPos = str.indexOf('.');
	let bracketPos = str.indexOf('[');
	if (dotPos !== -1 && dotPos < bracketPos) {
		// Handle a dot appearing earlier than a bracket.
		return str.substr(0, dotPos);
	} else if (bracketPos !== -1) {
		// Handle a bracket which is now before a dot.
		return str.substr(0, bracketPos);
	} else {
		// Take the whole thing - there is no dot or bracket.
		return str;
	}
};
