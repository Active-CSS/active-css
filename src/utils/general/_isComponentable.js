const _isComponentable = el => {
	return (![ 'HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'TEMPLATE' ].includes(el.tagName) && el.closest && !el.closest('head') && !el.shadowRoot);
};
