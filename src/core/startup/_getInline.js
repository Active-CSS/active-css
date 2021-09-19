const _getInline = (inlineConfigTags) => {
	// Initial embedded style type="text/acss" detection prior to any user config.
	inlineConfigTags.forEach(acssTag => {
		_addACSSStyleTag(acssTag);	// This function as well as adding the config returns the applicable Active ID for use in running the loaded event.
	});
};
