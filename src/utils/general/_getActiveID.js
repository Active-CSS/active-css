const _getActiveID = obj => {
	if (!obj.isConnected) {
		return _getTempActiveID(obj);
	}
	if (obj) {
		if (!obj._acssActiveID) {
			activeIDTrack++;
			let fullID = 'id-' + activeIDTrack;
			obj._acssActiveID = fullID;
			idMap[fullID] = obj;
		}
		return obj._acssActiveID;
	}
	return false;
};
