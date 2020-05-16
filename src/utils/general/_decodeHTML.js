ActiveCSS._decodeHTML = str => {
	// This is use in the mimic command to work with updating the title. It's not the same as _escapeItem().
	let doc = new DOMParser().parseFromString(str, 'text/html');
	return doc.documentElement.textContent;
};
