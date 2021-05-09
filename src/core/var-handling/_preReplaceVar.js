const _preReplaceVar = (str, varReplacementRef=-1, func='') => {
	let isRender = func.startsWith('Render');
	if (varReplacementRef === -1) return (isRender) ? _escapeItem(str) : str;
	if (typeof resolvingObj[varReplacementRef] === 'undefined') resolvingObj[varReplacementRef] = [];
	let subRef = resolvingObj[varReplacementRef].length;
	let ret = '__acss' + UNIQUEREF + '_' + varReplacementRef + '_' + subRef + '_';
	resolvingObj[varReplacementRef][subRef] = (isRender) ? _escapeItem(str) : str;
	return ret;
};

