const _addCancelAttr = (obj, func) => {
	let activeID = obj.dataset.activeid;
	if (!cancelIDArr[activeID]) cancelIDArr[activeID] = [];
	cancelIDArr[activeID][func] = true;
};
