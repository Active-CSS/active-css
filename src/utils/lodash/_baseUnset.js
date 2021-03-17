/**
 * The base implementation of `unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
const _baseUnset = (object, path) => {
	path = _castPath(path, object);
	object = _parent(object, path);
	return object == null || delete object[_toKey(_last(path))];
};
