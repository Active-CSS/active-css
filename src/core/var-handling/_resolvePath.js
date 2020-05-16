const _resolvePath = (path, obj=self, separator='.') => {
	var properties = Array.isArray(path) ? path : path.split(separator);
	properties.reduce((prev, curr) => prev && prev[curr], obj);
	return obj;
};
