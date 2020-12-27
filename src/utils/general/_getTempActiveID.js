const _getTempActiveID = obj => {
	// This is used before a component is drawn for real. It is needed as the output starts off in string form, and when added to the page the attribute is removed
	// and a real internal value gets assigned.
	if (obj && obj.dataset) {
		if (!obj.dataset.activeid) {
			activeIDTrack++;
			obj.dataset.activeid = 'id-' + activeIDTrack;
		}
		return obj.dataset.activeid;
	}
	return false;
};
