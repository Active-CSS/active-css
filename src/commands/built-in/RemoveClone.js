_a.RemoveClone = o => {
	let el = _getSel(o, o.actVal);
	let ref = el.dataset.activeid;
	if (ref) mimicClones[ref] = null; 
};
