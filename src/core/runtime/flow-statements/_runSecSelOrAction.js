const _runSecSelOrAction = obj => {
	if (obj.loopWhat == 'action') {
		let objCopy = _clone(obj);
		objCopy.targ = objCopy.targ[objCopy.targPointer].value;
		_performTarget(objCopy, 0);
	} else {
		_performSecSel(obj);
		_resetExitTarget(obj._imStCo);
	}
};
