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
		str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-_]+)\}/gi, function(_, c) {	// jshint ignore:line
			// Note: if the item is empty or if it references an empty component, we always finally return '';
			let customElComp = false;
			if (c.substr(0, 11) == '_acss-host_') {
				// This is a component assigned to a custom element. We want this to get scoped when it is drawn regardless of whether there are events or not.
				customElComp = true;
				c = c.substr(11);
			}
			if (!components[c]) return '{|' + c + '}';
			let ret = components[c].data.trim();
			found = true;
			ret = ActiveCSS._sortOutFlowEscapeChars(ret);
			// Handle any looping variable replacement in the component.
			ret = (o.loopRef != '0') ? _replaceLoopingVars(ret, o.loopVars) : ret;
			if (components[c].shadow || components[c].scoped || customElComp) {
				// This is supposed to be added to its container after the container has rendered. We shouldn't add it now.
				// Add it to memory and attach after the container has rendered. Return a placeholder for this component.
				// Note, we have by this point *drawn the contents of this component - each instance is individual*, so they get rendered separately and
				// removed from the pending array once drawn.
				compCount++;
				let compRef = '<data-acss-component data-name="' + c + '" data-ref="' + compCount + '"></data-acss-component>';
				compPending[compCount] = ret;
				// Replace the fully rendered component instance with the compRef placeholder.
				ret = compRef;
			} else {
				ret = _replaceAttrs(o.obj, ret, null, null, o.func, o.varScope);
				ret = _replaceStringVars(o.ajaxObj, ret);
			}
			return (ret) ? ret : '';
		});
		if (!found) break;
	}
	if (co == 50) console.log('Active CSS recursion detected during component rendering. Skipped after 50 attempts.\nFile: ' + o.file + ', line: ' + o.line);
	return str;
};
