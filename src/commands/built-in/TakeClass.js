_a.TakeClass = o => {
	// Take class away from any element that has it.
	let cl = o.actVal.substr(1);
	_eachRemoveClass(cl, cl, o.doc);
	_a.AddClass(o);
};
