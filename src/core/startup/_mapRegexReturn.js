ActiveCSS._mapRegexReturn = (mapObj, str, mapObj2=null) => {
	if (typeof str !== 'string') return str;	// If it's not a string, we don't have to replace anything. Here for speed.
	let reg = new RegExp(Object.keys(mapObj).join('|'), 'gim');
	str = str.replace(reg, function(matched){
		if (!mapObj2) {
			return mapObj[matched];
		} else {
			// Match with a second object, not the regex object.
			return mapObj2[matched];
		}
	});
	return str;
};
