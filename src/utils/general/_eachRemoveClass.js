const _eachRemoveClass = (inClass, classToRemove, doc, scope='') => {
	doc.querySelectorAll(scope + ' .' + inClass + ((scope !== '') ? ',' + scope + '.' + inClass : '')).forEach(function (obj, index) {
		if (!obj) return; // element is no longer there.
		ActiveCSS._removeClassObj(obj, classToRemove);
	});
};
