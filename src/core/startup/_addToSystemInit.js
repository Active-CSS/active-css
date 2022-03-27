const _addToSystemInit = (inlineActiveID, command, actionVal) => {
	let sel, ev;
	if (inlineActiveID) {
		sel = '~_embedded_' + inlineActiveID;
		ev = 'loaded';
	} else {
		sel = '~_acssSystem';
		ev = !setupEnded ? 'init' : 'afterLoadConfig';
	}
	return sel + ':' + ev + '{' + command + ':' + actionVal + ';}';
};
