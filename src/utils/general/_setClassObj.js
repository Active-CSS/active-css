const _setClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.className = str;
};
