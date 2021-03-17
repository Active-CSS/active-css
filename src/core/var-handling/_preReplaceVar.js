const _preReplaceVar = (str, varReplacementRef=-1) => {
	if (varReplacementRef === -1) return str;
	if (typeof resolvingObj[varReplacementRef] === 'undefined') resolvingObj[varReplacementRef] = [];
	let subRef = resolvingObj[varReplacementRef].length;
	let ret = '__acss' + UNIQUEREF + '_' + varReplacementRef + '_' + subRef + '_';
	resolvingObj[varReplacementRef][subRef] = str;
	return ret;
};

