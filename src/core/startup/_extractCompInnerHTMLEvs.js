const _extractCompInnerHTMLEvs = compHTMLBlock => {
	// Extract out any inner event flows inside this component HTML block, replace with a placeholder that will be replaced with anything rendered when the
	// events are run, or replace with nothing if there is nothing new to render.
	// There may be more than one event flow block in this HTML block, and each will have its own event flow run sequentially between beforeComponentOpen and
	// componentOpen.
	// The variable compInnerEvMap stores the event flows via a reference to the placeholder.
	// When found in _parseConfig when handling the HTML block, any events after placed directly after the html block, so they inherit the component scoping.
	// When the component is later rendered, internal &:__midComponentOpen events are run, and anything rendered is placed into the HTML placeholder.
	// No asynchronous elements are currently supported in the __midComponentOpen events.

	let str = compHTMLBlock.replace(/({\:)([\s\S]*?)\:}/gi, function(_, startBit, innards) {
		compInnerEvCo++;
		compInnerEvMap['ev_' + compInnerEvCo] = '&:__midComponentOpen_' + compInnerEvCo + ' {' + innards + '}';
		return '__acssInnerHTMLEv_' + compInnerEvCo + '__';
	});

	// Put the new events at the end of the str so they can continue to be prepared in the remainder of _parseConfig.
	return str;
};
