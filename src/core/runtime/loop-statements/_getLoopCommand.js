const _getLoopCommand = str => {
	let wot = str.substr(0, 5);
	return (LOOPCOMMANDS.indexOf(wot) !== -1) ? wot.trim() : false;
};

