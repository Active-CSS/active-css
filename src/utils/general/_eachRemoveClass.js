const _eachRemoveClass = (inClass, classToRemove, doc) => {
	doc.querySelectorAll('.' + inClass).forEach(function (obj, index) {
		if (!obj) return; // element is no longer there.
		ActiveCSS._removeClassObj(obj, classToRemove);
	});
};
