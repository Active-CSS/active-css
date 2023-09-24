const _eachRemoveClass = (o, theClass, scope='') => {
	let sels = _getSels(o, scope + ' .' + theClass);
	if (sels) {
		sels.forEach(function (obj, index) {
			if (!obj) return; // element is no longer there.
			ActiveCSS._removeClassObj(obj, theClass);
		});
	}
};
