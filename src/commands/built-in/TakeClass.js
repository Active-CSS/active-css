_a.TakeClass = o => {
	if (o.doc != document) {
		console.log('Active CSS error - you cannot take a class if the element clicked on is not going to take the class. With iframes, use give-class instead.');
		return false;
	}
	// Take class away from any element that has it.
	let cl = o.actVal.substr(1);
	_eachRemoveClass(cl, cl, o.doc);
	_a.AddClass(o);
};
