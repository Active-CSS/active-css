/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
const _parent = (object, path) => {
	return path.length < 2 ? object : _baseGet(object, _slice(path, 0, -1));
};
