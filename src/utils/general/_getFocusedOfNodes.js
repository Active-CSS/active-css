const _getFocusedOfNodes = (sel, o) => {
	// Find the current focused node in the list, if there is one.
	let targArr, nodes, obj, i = -1, useI = -1;
	targArr = _splitIframeEls(sel, o.obj, o.compDoc);
	if (!targArr) return false;	// invalid target.
	if (targArr[0].activeElement === null) return -1;
	nodes = targArr[0].querySelectorAll(targArr[1]) || null;
	for (obj of nodes) {
		i++;
		if (obj.isSameNode(targArr[0].activeElement)) {
			useI = i;
			break;
		}
	}
	return [ nodes, useI ];
};
