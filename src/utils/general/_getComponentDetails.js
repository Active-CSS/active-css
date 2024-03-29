const _getComponentDetails = rootNode => {
	let rootNodeHost;
	if (!rootNode.isSameNode(document)) {
		// Get the component variables so we can run this element's events in context.
		rootNodeHost = rootNode;
		if (supportsShadow && rootNode instanceof ShadowRoot) {
			rootNodeHost = rootNode.host;
		}
		return {
			component: rootNodeHost._acssComponent,
			compDoc: rootNode,
			varScope: rootNodeHost._acssVarScope,
			evScope: rootNodeHost._acssEvScope,
			strictPrivateEvs: rootNodeHost._acssStrictPrivEvs,
			privateEvs: rootNodeHost._acssPrivEvs,
			strictVars: rootNodeHost._acssStrictVars,
			topEvDoc: rootNodeHost._acssTopEvDoc,
			inheritEvDoc: rootNodeHost._acssInheritEvDoc
//			compHost: rootNodeHost._acssHost
		};
	} else {
		return {
			component: null,
			compDoc: null,
			varScope: null,
			evScope: null,
			strictPrivateEvs: null,
			privateEvs: null,
			strictVars: null,
			topEvDoc: null,
			inheritEvDoc: null
//			compHost: null
		};
	}
};
