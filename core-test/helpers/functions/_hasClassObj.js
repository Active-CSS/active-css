function _hasClassObj(obj, str) {
	if (!obj) return false;
	return obj.classList.contains(str) || false;
}
