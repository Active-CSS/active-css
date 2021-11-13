const _getFocusedOfNodes = (sel, o, startingFrom='') => {
	// Find the current focused node in the list, if there is one.
	let targArr, nodes, obj, i = -1, useI = -1, checkNode;
	targArr = _splitIframeEls(sel, o);
	if (!targArr) return false;	// invalid target.
	checkNode = (startingFrom !== '') ? _getSel(o, startingFrom) : (targArr[0].activeElement) ? targArr[0].activeElement : (targArr[0].ownerDocument) ? targArr[0].ownerDocument.activeElement : false;
	if (!checkNode) return -1;
	nodes = targArr[0].querySelectorAll(targArr[1]) || null;
	for (obj of nodes) {
		i++;
		if (obj.isSameNode(checkNode)) {
			useI = i;
			break;
		}
	}
	return [ nodes, useI ];
};
