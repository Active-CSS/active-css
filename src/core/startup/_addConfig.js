const _addConfig = (str, o) => {
	// Concatenate the config files before processing.
	// Before we add the config, we want to add line numbers for debug.
	let configLineArr = str.match(/^.*((\r\n|\n|\r)|$)/gm);
	let newStr = '';
	for (let n = 0; n < configLineArr.length; n++) {
		newStr += '*debugfile:' + o.file + ':' + (n + 1) + '*' + configLineArr[n];
	}
	str = newStr;
	concatConfigCo++;

	let configItems = _parseConfig(str, o.inlineActiveID);

	configBox.push({ file: o.file, styles: configItems });

	let tmpParse = {};
	parsedConfig = Object.assign(tmpParse, parsedConfig, configItems);

	// If this is last file, run the config generator.
	if (!initInlineLoading && concatConfigCo >= concatConfigLen) {
		_readSiteMap(o);
	}
};
