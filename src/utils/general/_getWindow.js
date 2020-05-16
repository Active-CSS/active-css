const _getWindow = doc => {
	try {
		return doc.defaultView || doc.parentWindow;
	} catch(err) {
		return window;
	}
};
