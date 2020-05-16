// Courtesy of https://stackoverflow.com/a/54733755
// See stackoverflow for full comments.
const _set = (obj, path, value) => {
	if (Object(obj) !== obj) return obj;
	if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []; 
	path.slice(0,-1).reduce((a, c, i) =>
		Object(a[c]) === a[c] ? a[c] : a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}, obj)[path[path.length - 1]] = value;
	return obj;
};
