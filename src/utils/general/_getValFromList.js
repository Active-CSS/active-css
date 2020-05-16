const _getValFromList = (list, item, returnPos=false) => {
	let key, obj, prop, co = -1;
	for (key in list) {
		if (!list.hasOwnProperty(key)) continue;
		co++;
		obj = list[key];
		if (returnPos && obj.name == item) return co;
		for (prop in obj) {
			if(!obj.hasOwnProperty(prop)) continue;
			// Return item after removing any quotes.
			if (!returnPos && obj[prop] == item) {
				return obj.value.replace(/"/g, '');
			}
		}
	}
	return (returnPos) ? -1 : false;
};
