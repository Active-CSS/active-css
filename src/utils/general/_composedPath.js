const _composedPath = (e) => {
	// Needed for unsupported browsers, like old Edge.
	if (!e.composedPath) {
		if (e.path) {
			return e.path;
		} 
		let target = e.target;
		let path = [];
		while (target.parentNode !== null) {
			path.push(target);
			target = target.parentNode;
		}
		path.push(document, window);
		return path;
	} else {
		return e.composedPath();
	}
};
