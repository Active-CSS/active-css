const _getComponentDetails = rootNode => {
	let rootNodeHost, component, compDoc, varScope, privateEvs;
	if (!rootNode.isSameNode(document)) {
		// Get the component variables so we can run this element's events in context.
		rootNodeHost = rootNode;
		if (supportsShadow && rootNode instanceof ShadowRoot) {
			rootNodeHost = rootNode.host;
		}
		component = rootNodeHost._acssComponent;
		compDoc = rootNode;
		varScope = rootNodeHost._acssVarScope;
		privateEvs = rootNodeHost._acssPrivEvs;
	} else {
		component = null;
		compDoc = null;
		varScope = null;
		privateEvs = null;
	}
	return { component, compDoc, varScope, privateEvs };
};
