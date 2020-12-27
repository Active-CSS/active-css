const _addCancelAttr = (obj, func) => {
	let activeID = _getActiveID(obj);
	if (!cancelIDArr[activeID]) cancelIDArr[activeID] = [];
	cancelIDArr[activeID][func] = true;
};
