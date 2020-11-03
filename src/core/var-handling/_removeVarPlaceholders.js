const _removeVarPlaceholders = obj => {
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
			if (typeof varMap[thisVar] == 'undefined') varMap[thisVar] = [];
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
};
