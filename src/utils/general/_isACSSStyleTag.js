const _isACSSStyleTag = (nod) => {
	return (nod.tagName == 'STYLE' && nod.hasAttribute('type') && nod.getAttribute('type') == 'text/acss');
};
