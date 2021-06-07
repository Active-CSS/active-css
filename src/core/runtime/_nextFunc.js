const _nextFunc = o => {
	let counter = o.actPos + 1;
	if (counter < o._funcObj.pars.actValsLen) {
		let funcOCopy = _clone(o._funcObj.oCopy);
		let funcOPars = _clone(o._funcObj.pars);
		_actionValLoopDo(funcOCopy, funcOPars, o._funcObj.obj, o._funcObj.runButElNotThere, counter);
	}
};
