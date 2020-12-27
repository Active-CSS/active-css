const _replaceTempActiveID = obj => {
	if (obj && obj.dataset && obj.dataset.activeid) {
		obj._acssActiveID = obj.dataset.activeid;
		obj.removeAttribute('data-activeid');
		idMap[obj._acssActiveID] = obj;
	}
};
