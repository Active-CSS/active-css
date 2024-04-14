const _hypenToCamel = str => {
	return str.replace(/-([a-z])/g, wot => {
		return wot[1].toUpperCase();
	});
};
