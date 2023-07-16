const _checkBreakLoop = (_imStCo, innerType) => {
	let breakOutOfContinue = (innerType == 'inner') ? false : true;
	if (typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break', true) ||
			_decrBreakContinue(_imStCo, 'continue', breakOutOfContinue) ||
			_checkExitTarget(_imStCo)
		) {
		return true;
	}

	return false;
};
