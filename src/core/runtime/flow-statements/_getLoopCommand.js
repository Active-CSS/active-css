const _getLoopCommand = str => {
	if (str.startsWith('@else if ')) {
		return { name: '@else if', type: 'notloop' };
	} else if (str.startsWith('@else media ')) {
		return { name: '@else media', type: 'notloop' };
	} else if (str.startsWith('@else support ')) {
		return { name: '@else support', type: 'notloop' };
	} else {
		let pos = str.indexOf(' ');
		let wot = (pos !== -1) ? str.substr(0, pos) : str;
		if (wot && STATEMENTS.indexOf(wot) !== -1) {
			return { name: wot.trim(), type: ((wot == '@each' || wot == '@for' || wot == '@while') ? 'loop' : 'notloop') };
		} else {
			return false;
		}
	}
};

