const _removeVarPlaceholders = obj => {
	/**
	* Handle text nodes.
	* Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.
	*/
	// Remove variable placeholders. If there is no content yet, leave an empty text node.

	let treeWalker = document.createTreeWalker(
		obj,
		NodeFilter.SHOW_COMMENT
	);

	// Iterate tree and find unique ref enclosures, mark content node directly with var reference and remove comment nodes.
	let nodesToRemove = [];
	let thisNode, thisVar, insertedNode;
	while (treeWalker.nextNode()) {
		thisNode = treeWalker.currentNode;
		if (thisNode.data.substr(0, 11) == 'active-var-') {
			nodesToRemove.push(thisNode);	// Mark for removal.
			thisVar = thisNode.data.substr(11);
			// Now we can get rid of the comments altogether and make the node itself be the reference.
			if (varMap[thisVar] === undefined) varMap[thisVar] = [];
			if (thisNode.nextSibling.data == '/active-var') {
				// There is no content there. Insert an empty text node now. A variable was probably empty when first drawn.
				nodesToRemove.push(thisNode.nextSibling);	// Mark for removal.
				insertedNode = thisNode.parentNode.insertBefore(document.createTextNode(''), thisNode.nextSibling);
				varMap[thisVar].push(insertedNode);
			} else {
				varMap[thisVar].push(thisNode.nextSibling);
			}
		} else if (thisNode.data == '/active-var') {
			nodesToRemove.push(thisNode);	// Mark for removal. Don't remove them yet as it buggers up the treewalker.
		}
	}

	nodesToRemove.forEach(nod => {	// jshint ignore:line
		nod.remove();
	});


	/**
	* Handle style tags (but not embedded Active CSS).
	* Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.
	*/
	// We'll be storing reactive variable references to the style tag (varStyleMap) + the reference to the original contents of the style tag (varInStyleMap).
	treeWalker = document.createTreeWalker(
		obj,
		NodeFilter.SHOW_ELEMENT
	);
	let str, el;

	do {
		el = treeWalker.currentNode;
		if (el.tagName == 'STYLE' && !_isACSSStyleTag(el)) {
			if (!el._acssActiveID) _getActiveID(el);
			str = treeWalker.currentNode.textContent;
			// Store the original contents of the style tag with variable placeholders.
			if (varInStyleMap[el._acssActiveID] === undefined) varInStyleMap[el._acssActiveID] = str;

			// Now set up references for the reactive variable to link to the style tag. This way we only update style tags that have changed.
			// Remove the variable placeholders at the same time.
			str = varInStyleMap[el._acssActiveID].replace(STYLEREGEX, function(_, wot, wot2, wot3) {	// jshint ignore:line
				if (varStyleMap[wot] === undefined) varStyleMap[wot] = [];
				varStyleMap[wot].push(el);
				let thisColonPos = wot.indexOf('HOST');
				if (thisColonPos !== -1) {
					let varName = wot.substr(thisColonPos + 4);
					let varHost = idMap['id-' + wot.substr(1, thisColonPos - 1)];
					if (!varHost || !varHost.hasAttribute(varName)) return '';
					return varHost.getAttribute(varName);
				} else {
					// This is a regular scoped variable. Find the current value and return it or return what it was if it isn't there yet.
					let scoped = _getScopedVar(wot, '___none');
					return (scoped.val) ? scoped.val : '';
				}
				return wot2 || '';
			});
			el.textContent = str;	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
		}
	} while (treeWalker.nextNode());
};
