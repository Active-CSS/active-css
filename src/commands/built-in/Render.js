// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	// Handle quotes.
	let content = _handleQuoAjax(o, o.actVal);	// Rejoin the string.

	// Make a copy of the target selector.
	// The child nodes of the target element can be referenced and output in inner components by referencing {$CHILDREN}.
	// The actual node itself can be referenced and output in inner components by referencing {$SELF}.
	let selfTree = '', childTree = '';
	if (o.secSelObj.nodeType === Node.ELEMENT_NODE) {
		let copyOfSecSelObj = o.secSelObj.cloneNode(true);
		if (content.indexOf('{$SELF}') !== -1) {
			selfTree = copyOfSecSelObj.outerHTML;
			o.renderPos = 'replace';
		}
		if (content.indexOf('{$CHILDREN}') !== -1) {
			childTree = copyOfSecSelObj.innerHTML;
		}
	}

	// Handle any components. This is only in string form at the moment and replaces the component with a placeholder - not the full html.
	content = _replaceComponents(o, content);

	// Handle any ajax strings.
	content = _replaceStringVars(o.ajaxObj, content);

	content = _replaceScopedVars(content, o.secSelObj, 'Render', null, false);

	_renderIt(o, content, childTree, selfTree);
};
