/**
* The base implementation of `_.set`.
*
* @private
* @param {Object} object The object to modify.
* @param {Array|string} path The path of the property to set.
* @param {*} value The value to set.
* @param {Function} [customizer] The function to customize path creation.
* @returns {Object} Returns `object`.
*/
const _baseSet = (object, path, value, customizer) => {
	if (!_isObject(object)) return object;
	path = _castPath(path, object);

	var index = -1, length = path.length, lastIndex = length - 1, nested = object;

	while (nested != null && ++index < length) {
		var key = _toKey(path[index]),
		newValue = value;

		if (index != lastIndex) {
			var objValue = nested[key];
			newValue = customizer ? customizer(objValue, key, nested) : undefined;
			if (newValue === undefined) {
				newValue = _isObject(objValue) ? objValue : (_isIndex(path[index + 1]) ? [] : {});
			}
		}
		_assignValue(nested, key, newValue);
		nested = nested[key];
	}
	return object;
};
