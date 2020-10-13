const _getComponentRoot = (obj) => {
	// This gets the root of the component - either a scoped host or a shadow DOM rootNode.
	let scopedHost = (obj.parentElement && (!supportsShadow || supportsShadow && !(obj.parentNode instanceof ShadowRoot))) ? obj.parentElement.closest('[data-active-scoped]') : false;
	let rootNode = obj.getRootNode();
	if (!scopedHost && rootNode.isSameNode(document)) {
		// There is no component that contains this element.
		return document;
	} else if (!scopedHost) {
		// This element must be in a shadow root.
		return rootNode;
	} else {
		// If it's gotten this far, then there is a scoped component involved.
		if (scopedHost && rootNode.isSameNode(document)) {
			// This has to be a scoped component.
			return scopedHost;
		} else {
			// If it has gotten this far, there is both a scoped component and a shadow component above this element. It won't be in the document.
			// But which component is this element really in?
			// If the shadow root contains the same exact scoped component, then the element is in the scoped component, as it is lower in the DOM tree.
			// If the shadow root does not contain the same exact scoped component, then the element must be in the shadow root, as it is lower in the DOM tree.
			// Make sure we check on the exact same scoped component, so we need the activeid for this.
			return (idMap[scopedHost._acssActiveID]) ? scopedHost : rootNode;
		}
	}
};
