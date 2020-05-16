const _getActiveID = obj => {
	if (obj && obj.dataset) {
		if (!obj.dataset.activeid) {
			activeIDTrack++;
			obj.dataset.activeid = 'id-' + activeIDTrack;
		}
		return obj.dataset.activeid;
	}
	return false;
};
