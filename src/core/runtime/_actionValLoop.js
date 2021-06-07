const _actionValLoop = (oCopy, pars, obj, runButElNotThere) => {
	_actionValLoopDo(oCopy, pars, obj, runButElNotThere, 0);
};

const _actionValLoopDo = (oCopy, pars, obj, runButElNotThere, counter) => {
	let oCopy2 = _clone(oCopy);

	oCopy2.actVal = pars.actVals[counter].trim();	// Put the original back.
	oCopy2.actPos = counter;	// i or label (not yet built).
	oCopy2.secSelObj = obj;
	oCopy2._tgEvCo = 'i' + targetCounter++;
	oCopy2._tgResPos = oCopy2._subEvCo + oCopy2._tgEvCo;
	oCopy2._funcObj = { oCopy, pars, obj, counter, runButElNotThere };
	_handleFunc(oCopy2, null, runButElNotThere);
};
