/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
*/
const _castPath = (value, object) => {
	if (_isArray(value)) return value;
	return _isKey(value, object) ? [value] : _stringToPath(_toString(value));
};
