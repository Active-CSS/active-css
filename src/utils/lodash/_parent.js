/**
 * Gets the parent value at `path` of `object`.
 * ACSS mod: use _get instead of _baseget as we don't need the default value supported function.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
const _parent = (object, path) => {
	return path.length < 2 ? object : _get(object, _slice(path, 0, -1));
};
