const _addConfig = (str, o) => {
	// Concatenate the config files before processing.
	// On empty config, throw a warning.
	let configItems;
	if (str.trim() == '') {
		if (o.file.startsWith('_inline_id-')) {
			console.log('There is an empty embedded ACSS style tag on the page. Skipping.');
		} else {
			console.log('There is a config file trying to load with no config present. Skipping. File: ' + o.file);
		}
		configItems = {};
	} else {
		// Before we add the config, we want to add line numbers for debug.
		let configLineArr = str.match(/^.*((\r\n|\n|\r)|$)/gm);
		let newStr = '';
		for (let n = 0; n < configLineArr.length; n++) {
			newStr += '*debugfile:' + o.file + ':' + (n + 1) + '*' + configLineArr[n];
		}
		str = newStr;

		configItems = _parseConfig(str, o.inlineActiveID);
	}

	concatConfigCo++;
	configBox.push({ file: o.file, styles: configItems });

	let tmpParse = {};
	parsedConfig = Object.assign(tmpParse, parsedConfig, configItems);

	// Set up CSS placeholder variable for extracting out any CSS that may be found in the ACSS.
	// o.inlineActiveID will be populated if embedded and o.file will contain that, otherwise o.inlineActiveID will be empty.
	// If not embedded, all the CSS can be appended to the same stylesheet as it can't be unloaded once added after ACSS initialisation or load-config.
	// If CSS needs to be removed, the developer would place it in an embedded CSS or ACSS style tag and not through initial config load or via load-config.
	_cssExtractInit(o.file);

	// If this is last file, run the config generator.
	if (!initInlineLoading && concatConfigCo >= concatConfigLen) {
		_readSiteMap(o);

		// Restart the sync queue if await was used.
		_syncRestart(o, o._subEvCo);
	}
};
