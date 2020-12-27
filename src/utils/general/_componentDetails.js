const _componentDetails = el => {
	let rootNode = _getRootNode(el);
	return _getComponentDetails(rootNode);
};
