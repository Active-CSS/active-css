const _toggleClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	obj.classList.toggle(str);
};
