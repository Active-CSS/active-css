_a.RemoveClone = o => {
	let el = _getSel(o, o.actVal);
	let ref = _getActiveID(el);
	if (ref) mimicClones[ref] = null; 
};
