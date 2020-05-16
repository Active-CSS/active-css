const _replaceComponents = (o, str, loopI) => {
	// This needs to be recursive to facilitate easier syntax. XSS defense needs to occur elsewhere otherwise this ceases to be useful. This must stay recursive.
	let co = 0, found;
	while (co < 50) {
		found = false;
		co++;

		// Handle ID tag content insertion first.
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-_]+)\}/gi, function(_, c) {	// jshint ignore:line
			let el = document.getElementById(c);
			if (el) return el.innerHTML;
			// Return it as it is if the element is not there.
			return '{#' + c + '}';
		});

		// Now handle real component insertion.
		// "jshint" thinks this function in a loop may cause semantic confusion. It doesn't in practical terms, and we need it, hence we need the ignore line.
		str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-_]+)\}/gi, function(_, c) {	// jshint ignore:line
		// Note: if the item is empty or it if references an empty component, we always finally return '';
			if (!components[c]) return '{|' + c + '}';
			let ret = components[c].data.trim();
			found = true;
			ret = ActiveCSS._sortOutFlowEscapeChars(ret);
			// Handle any looping variable replacement in the component.
			ret = (o.loopRef != '0') ? _replaceLoopingVars(ret, o.loopVars) : ret;
			if (components[c].shadow) {
				// This is supposed to be added to its container after the container has rendered. We shouldn't add it now.
				// Add it to memory and attach after the container has rendered. Return a placeholder for this component.
				// Note, we have by this point *drawn the contents of this component - each instance is individual*, so they get rendered separately and
				// removed from the pending array once drawn.
				shadowCo++;
				let shadowRef = '<data-shadow data-name="' + c + '" data-ref="' + shadowCo + '" data-mode="' + components[c].mode + '"></data-shadow>';
				shadowPending[shadowCo] = ret;
				// Replace the fully rendered component instance with the shadowRef placeholder.
				ret = shadowRef;
			} else {
				ret = _replaceAttrs(o.obj, ret, null, null, o.func, o.shadowRef);
				ret = (ret.indexOf('{$') !== -1) ? _replaceStringVars(o.ajaxObj, ret) : ret;
			}
			return (ret) ? ret : '';
		});
		if (!found) break;
	}
	if (co == 50) console.log('Active CSS recursion detected during component rendering. Skipped after 50 attempts.\nFile: ' + o.file + ', line: ' + o.line);
	return str;
};
