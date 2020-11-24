const _isInlineLoaded = nod => {
	let fullFile = '_inline_' + _getActiveID(nod);
	return configBox.find(item => item.file === fullFile);
};
