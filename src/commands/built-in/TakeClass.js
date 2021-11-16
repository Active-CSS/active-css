_a.TakeClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	// Take class away from any element that has it, with an optional scope parameter.
	let aV = o.actVal;
	let pos = aV.indexOf('scope(');
	let cl, scope = '';
	if (pos !== -1) {
		cl = aV.substr(1, pos - 1).trim();
		scope = aV.substr(pos + 6, aV.length - pos - 7);
		o.actVal = cl;	// this is mutating - bad for the extension when that arrives - change this after it works.
	} else {
		cl = aV.substr(1);
	}
	_eachRemoveClass(cl, cl, o.doc, scope);
	_a.AddClass(o);
};
