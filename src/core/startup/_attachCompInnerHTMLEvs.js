const _attachCompInnerHTMLEvs = reducedCompHTMLblock => {
	let eventsToAdd = '';
	// Look for any inner event flow placeholders in the HTML block - we want to know which event flow number it is in compInnerEvMap.
	let str = reducedCompHTMLblock.replace(/__acssInnerHTMLEv_([\d]+)__/gi, function(_, evRefNum) {
		// Add the string containing this event flow to the inside of the component, which will get placed after the HTML block at the bottom of this script.
		eventsToAdd += compInnerEvMap['ev_' + evRefNum];
		// Cleanup the inner event flow map by removing the event flow that has just been handled.
		delete compInnerEvMap['ev_' + evRefNum];
		// Return the original found result, as that hasn't been changed.
		return _;
	});

	// Put the new event flows at the end of the HTML block so the syntax can continue to be prepared in the remainder of _parseConfig.
	// This is the last set up for inner component event flows.
	return str + eventsToAdd;

};
