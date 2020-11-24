const _regenConfig = (styleTag, opt) => {
	// Regenerate the config at the end of the current stack so we don't get a condition in the event flow that actions no longer exist.
	setTimeout(function() {
		let activeID = styleTag._acssActiveID;
		switch (opt) {
			case 'remove':
				// Remove the tag details from the config.
				parsedConfig = configBox.find(item => item.file == '_inline_' + activeID).styles;
				// Now run _makeVirtualConfig() with the option to remove matching config.
				_makeVirtualConfig('', '', null, true, '_inline_' + activeID);
				// Now remove the tag from configBox.
				concatConfigCo--;
				concatConfigLen--;
				configBox = configBox.filter(item => item.file != '_inline_' + activeID);
				parsedConfig = {};
				break;

			case 'addDevTools':
				_addACSSStyleTag(styleTag);
		}
	}, 0);
};
