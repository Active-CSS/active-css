const _regenConfig = (styleTag, opt) => {
	// Regenerate the config at the end of the current stack so we don't get a condition in the event flow that actions no longer exist.
	// There was a end-stack delay I don't think we need the delay now - the removal of config has been placed inside render itself.
	let activeID = styleTag._acssActiveID;
	switch (opt) {
		case 'remove':
			// Remove the tag details from the config.
			parsedConfig = configBox.find(item => item.file == '_inline_' + activeID).styles;
			// Remove any potentially extracted CSS from the page that came from this ACSS config tag.
			cssExtractRemoveTag('_inline_' + activeID);
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
};
