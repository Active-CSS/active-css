ActiveCSS._removeObj = obj => {
	if (!obj) return; // element is no longer there.
	obj.parentNode.removeChild(obj);
};
