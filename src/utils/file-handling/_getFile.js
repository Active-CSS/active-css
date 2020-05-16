const _getFile = (filePath, fileType, o={}) => {
	_ajax('GET', fileType, filePath, null, _addConfig.bind(this), _addConfigError.bind(this), o);
};
