ActiveCSS.init = (config) => {
	config = config || {};
	passiveEvents = (typeof config.passiveEvents == 'undefined') ? true : config.passiveEvents;
	inlineConfigTags = document.querySelectorAll('style[type="text/acss"]');
	if (autoStartInit) {
		if (inlineConfigTags) {
			// This only runs if there is no user config later in the page within the same call stack. If the Active CSS initialization is timed out until later on,
			// then obviously the initialization events will not run.
			lazyConfig = '';
			_initGetInline();	// function is at the bottom of this script.
		}
		autoStartInit = false;
	} else {
		userSetupStarted = true;
		if (setupEnded) {
			console.log('Cannot initialize Active CSS twice.');
			return;
		}
		lazyConfig = config.lazyConfig || '';
		config.configLocation = config.configLocation || console.log('No inline or Active CSS config file setup - see installation docs.');
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
		if (inlineConfigTags) _initGetInline();	// function is at the bottom of this script.
		for (thisFile of configArrTmp) {
			thisFile = thisFile.trim();
			configArr.push(_getBaseURL(thisFile));	// Build up the initial config list without anything after and including the "?".
			_getFile(thisFile, 'txt', { file: thisFile });
		}
	}
};

const _initGetInline = () => {
	// Initial inline style type="text/acss" detection prior to any user config.
	concatConfigLen += inlineConfigTags.length;
	inlineConfigTags.forEach(acssTag => {
		_addConfig(acssTag.innerHTML, { file: 'inline' });
	});
	inlineConfigTags = null;
};
