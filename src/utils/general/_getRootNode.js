const _getRootNode = obj => {
	if (!supportsShadow) {
		// Either this element is in a scoped component, or it is in the document. It's a simple check.
		return _getScopedRoot(obj) || document;
	} else {
		// Either this element is in a scoped component, a shadow DOM component, or the document, so it needs a more thorough check.
		return _getComponentRoot(obj);
	}
};
