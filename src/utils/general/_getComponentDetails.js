const _getComponentDetails = rootNode => {
	let rootNodeHost, component, compDoc, compRef, privateEvs;
	if (!rootNode.isSameNode(document)) {
		// Get the component variables so we can run this element's events in context.
		rootNodeHost = rootNode;
		if (supportsShadow && rootNode instanceof ShadowRoot) {
			rootNodeHost = rootNode.host;
		}
		component = rootNodeHost._acssComponent;
		compDoc = rootNode;
		compRef = rootNodeHost._acssCompRef;
		privateEvs = rootNodeHost._acssPrivEvs;
	} else {
		component = null;
		compDoc = null;
		compRef = null;
		privateEvs = null;
	}
	return { component, compDoc, compRef, privateEvs };
};
