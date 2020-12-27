const _isFromFile = (fileToRemove, configPart) => {
	let item, i, configPartLen = configPart.length, key;
	if (configPartLen == 0) {
		for (key in configPart) {
			if (_isFromFile(fileToRemove, configPart[key])) {
				return true;
			}
		}
	} else {
		for (i = 0; i < configPartLen; i++) {
			item = configPart[i];
			if (Array.isArray(item)) {
				if (_isFromFile(fileToRemove, item)) {
					return true;
				}
			} else {
				let thisFile = item.file;
				if (thisFile === fileToRemove) {
					return true;
				}
			}
		}
	}
	return false;
};
