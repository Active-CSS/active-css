const _handleCompInnerHTMLEvents = (html, eventObj) => {
	// Look for any inner event flow placeholders in the HTML block - we want to know which mid component event to run.
	let str = html.replace(/__acssInnerHTMLEv_([\d]+)__/gi, function(_, evRefNum) {
		// Handle this mid comonponent event.
		eventObj.evType = '__midComponentOpen_' + evRefNum;
		_handleEvents(eventObj);

		// If there are now any results to render for this placeholder, return them, otherwise render an empty string.
		let res = '';
		if (compInnerEvResMap['res_' + evRefNum]) {
			res = compInnerEvResMap['res_' + evRefNum];
			delete compInnerEvResMap['res_' + evRefNum];
		}
		return res;
	});

	return str;
};
