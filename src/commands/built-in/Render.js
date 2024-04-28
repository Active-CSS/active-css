// Note: beforebegin = as previous sibling, afterbegin = as first-child, beforeend = as last-child, afterend = as next sibling.
_a.Render = o => {
	if (!_isConnected(o.secSelObj)) return false;

	let allowScripts;
	let content = o.actVal;
	if (content.indexOf('allow-scripts') !== -1) {
		content = content.replace(INQUOTES, function(_, innards) {
			return innards.replace(/allow\-scripts/g, '_acssAlloWScripts');
		});
		if (content.indexOf('allow-scripts') !== -1) {
			allowScripts = true;
		}
		content = content.replace(/allow\-scripts/g, '').replace(/_acssAlloWScripts/g, 'allow-scripts').trim();
	}

	// Handle quotes.
	content = _handleQuoAjax(o, content);

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
	content = _replaceComponents(o, content);

	if (o.event.startsWith('__midComponentOpen_') && o.origSecSel === '&') {
		if (o.renderPos) {
			_err('"render" is the only render command that is allowed in a component\'s HTML block event flow.', o);
		}
		// Get the mid component reference number.
		let refNum = o.event.substring(o.event.lastIndexOf('_') + 1);
		// If this is a string that is being rendered as part of a mid component html block cycle, store the results for use when the component itself is rendered.
		compInnerEvResMap['res_' + refNum] = (compInnerEvResMap['res_' + refNum] || '') + content;
		// Don't go any further, the string with get handled properly when the component gets rendered.
		return;
	}

	_renderIt(o, content, childTree, selfTree, allowScripts);
};
