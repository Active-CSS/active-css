// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	// Handle quotes.
	let content = _handleQuoAjax(o, o.actVal);	// Rejoin the string.
	// Second handle any components.
	content = _replaceComponents(o, content);
	// Lastly, handle any ajax strings.
	content = _replaceStringVars(o.ajaxObj, content);
	_renderIt(o, content);
};
