const _replaceComponents = (o, str) => {
	// This needs to be recursive to facilitate easier syntax. XSS defense needs to occur elsewhere otherwise this ceases to be useful. This must stay recursive.
	let co = 0, found;
	while (co < 50) {
		found = false;
		co++;

		// Handle ID tag content insertion first.
		str = _replaceHTMLVars(o, str);

		// Now handle real component insertion.
		// See create-element code for why this is used: "_acss-host_' + tag + '_"
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-]+)\}/gi, function(_, c) {	// jshint ignore:line
			// Note: if the item is empty or if it references an empty component, we always finally return '';
			let customElComp = false;
			if (c.substr(0, 11) == '_acss-host_') {
				// This is a component assigned to a custom element. We want this to get scoped when it is drawn regardless of whether there are events or not.
				customElComp = true;
				c = c.substr(11);
			}
			if (!components[c]) return '{|' + c + '}';

			let ret = components[c].data.trim();
			if (ret !== '') ret = ActiveCSS._sortOutFlowEscapeChars(ret);
			found = true;
			if (components[c].shadow ||
					components[c].scoped ||
					customElComp ||
					components[c].htmlFile ||
					components[c].cssFile ||
					components[c].htmlTempl ||
					components[c].cssTempl
				) {
				// This is supposed to be added to its container after the container has rendered. We shouldn't add it now.
				// Add it to memory and attach after the container has rendered. Return a placeholder for this component.
				// Note, we have by this point *drawn the contents of this component - each instance is individual*, so they get rendered separately and
				// removed from the pending array once drawn.
				compCount++;
				let compRef = '<data-acss-component data-name="' + c + '" data-ref="' + compCount + '"';
				if (components[c].htmlFile) compRef += ' data-html-file="' + escQuotes(components[c].htmlFile) + '"';
				if (components[c].cssFile) compRef += ' data-css-file="' + escQuotes(components[c].cssFile) + '"';
				if (components[c].jsonFile) compRef += ' data-json-file="' + escQuotes(components[c].jsonFile) + '"';
				if (components[c].htmlTempl) compRef += ' data-html-template="' + escQuotes(components[c].htmlTempl) + '"';
				if (components[c].cssTempl) compRef += ' data-css-template="' + escQuotes(components[c].cssTempl) + '"';
				if (components[c].observeOpt) compRef += ' data-observe-opt="' + escQuotes(components[c].observeOpt) + '"';
				if (components[c].selector) compRef += ' data-html-selector="' + escQuotes(components[c].selector) + '"';
				compRef += '></data-acss-component>';
				compPending[compCount] = ret;
				// Replace the fully rendered component instance with the compRef placeholder.
				ret = compRef;
			} else {
				ret = ActiveCSS._sortOutFlowEscapeChars(ret);
				let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
					{
						str: ret,
						func: o.func,
						o,
						obj: o.obj,
						varScope: o.varScope
					}
				);
				strObj = _handleVars([ 'strings' ],
					{
						obj: null,
						str: strObj.str,
						varScope: o.varScope
					},
					strObj.ref
				);
				strObj = _handleVars([ 'strings' ],
					{
						str: strObj.str,
						o: o.ajaxObj,
						varScope: o.varScope
					},
					strObj.ref
				);
				ret = _resolveVars(strObj.str, strObj.ref);
			}
			return (ret) ? ret : '';
		});
		if (!found) break;
	}
	if (co == 50) _err('Recursion detected during component rendering. Exited after 50 attempts', o);
	return str;
};
