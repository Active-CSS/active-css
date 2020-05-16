ActiveCSS.init = (config) => {
	if (setupEnded) {
		console.log('Cannot initialize Active CSS twice.');
		return;
	}
	lazyConfig = config.lazyConfig || '';
	passiveEvents = (typeof config.passiveEvents == 'undefined') ? true : config.passiveEvents;
	config.configLocation = config.configLocation || console.log('Active CSS config file not declared in setup.');
	if (config.debugMode) {
		debugMode = config.debugMode;
		if (document.parentNode) {
			console.log('Active CSS debug mode in iframe ID ' + window.frameElement.id + ': ' + debugMode);
		} else {
			console.log('Active CSS debug mode: ' + debugMode);
		}
	}
	let thisFile;
	let configArrTmp = config.configLocation.split(',');
	concatConfigLen = configArrTmp.length;
	for (thisFile of configArrTmp) {
		thisFile = thisFile.trim();
		configArr.push(_getBaseURL(thisFile));	// Build up the initial config list without anything after and including the "?".
		_getFile(thisFile, 'txt', { file: thisFile });
	}
};
