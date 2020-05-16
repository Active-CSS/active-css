ActiveCSS._sendInitMessages = () => {
	let initArrLen = devtoolsInit.length, i;
	for (i = 0; i < initArrLen; i++){
		_sendMessage(devtoolsInit[i][0], devtoolsInit[i][1], 'tracker', devtoolsInit[i][2]);
	}
	devtoolsInit = [];
};
