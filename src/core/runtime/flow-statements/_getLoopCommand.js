const _getLoopCommand = str => {
	let elseIfCheck = str.substr(0, 9).trim();
	if (elseIfCheck == '@else if') {
		return { name: '@else if', type: 'notloop' };
	} else {
		let pos = str.indexOf(' ');
		let wot = (pos !== -1) ? str.substr(0, pos) : str;
		if (wot && LOOPCOMMANDS.indexOf(wot) !== -1) {
			return { name: wot.trim(), type: ((wot == '@each' || wot == '@for') ? 'loop' : 'notloop') };
		} else {
			return false;
		}
	}
};

