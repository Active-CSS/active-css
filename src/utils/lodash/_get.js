/**
 * The base implementation of `_.get` without support for default values.
 * ACSS mod: renamed to _get because the core doesn't use default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
*/
const _get = (object, path) => {
	path = _castPath(path, object);
	var index = 0, length = path.length;
	while (object != null && index < length) {
		object = object[_toKey(path[index++])];
	}
	return (index && index == length) ? object : undefined;
};
