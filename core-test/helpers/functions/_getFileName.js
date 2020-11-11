function _getFileName(url) {
	// Returns just the filename from a URL.
	return url.split('/').pop().split('#')[0].split('?')[0];
}
