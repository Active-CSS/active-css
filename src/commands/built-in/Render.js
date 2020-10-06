// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	// Handle quotes.
	let content = _handleQuoAjax(o, o.actVal);	// Rejoin the string.

	// Make a copy of the target selector.
	// The child nodes of the target element can be referenced and output in inner components by referencing {$CHILDREN}.
	// The actual node itself can be referenced and output in inner components by referencing {$SELF}.
	let copyOfSecSelObj = o.secSelObj.cloneNode(true);
	let selfTree;
	if (content.indexOf('{$SELF}') !== -1) {
		selfTree = copyOfSecSelObj.outerHTML;
		o.renderPos = 'replace';
	}
	let childTree = copyOfSecSelObj.innerHTML;

	// Handle any components.
	content = _replaceComponents(o, content);
	// Handle any ajax strings.
	content = _replaceStringVars(o.ajaxObj, content);

	// Handle any reference to {$CHILDREN} that need to be dealt with with these child elements before any components get rendered.
	content = _renderRefElements(content, childTree, 'CHILDREN');
	// Handle any reference to {$SELF} that needs to be dealt with before any components get rendered.
	content = _renderRefElements(content, selfTree, 'SELF');

	_renderIt(o, content, childTree, selfTree);
};
