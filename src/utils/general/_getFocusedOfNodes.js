const _getFocusedOfNodes = (sel, o, startingFrom='') => {
	// Find the current focused node in the list, if there is one.
	let res, nodes, obj, i = -1, useI = -1, checkNode;
	res = _getSelector(o, sel, true);
	if (!res) return false;	// invalid target.
	checkNode = (startingFrom !== '') ? _getSel(o, startingFrom) : (res.doc.activeElement) ? res.doc.activeElement : (res.doc.ownerDocument) ? res.doc.ownerDocument.activeElement : false;
	if (!checkNode) return -1;
	nodes = res.obj || null;
	for (obj of nodes) {
		i++;
		if (obj.isSameNode(checkNode)) {
			useI = i;
			break;
		}
	}
	return [ nodes, useI ];
};
