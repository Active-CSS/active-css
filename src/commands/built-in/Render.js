// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	if (!_isConnected(o.secSelObj)) return false;
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
		// If this is a custom component, get the child elements for use later on.
		let upperTag = o.secSelObj.tagName.toUpperCase();
		if (customTags.includes(upperTag)) {
			childTree = copyOfSecSelObj.innerHTML;
		}
	}

	// Handle any ajax strings.
	let strObj = _handleVars([ 'strings' ],
		{
			str: content,
			o: o.ajaxObj
		}
	);
	content = _resolveVars(strObj.str, strObj.ref);

	// Handle any components. This is only in string form at the moment and replaces the component with a placeholder - not the full html.
	// It doesn't need progressive variable substitution protection - it contains this in the function itself.
	content = _replaceComponents(o, content, childTree);

	_renderIt(o, content, childTree, selfTree);
};
