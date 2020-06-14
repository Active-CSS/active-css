const _getRootNode = (obj) => {
	return (!document.head.attachShadow) ? document : obj.getRootNode();
};
