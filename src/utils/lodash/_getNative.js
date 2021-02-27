/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
*/
const _getNative = (object, key) => {
	var value = _getValue(object, key);
//	return _baseIsNative(value) ? value : undefined;	// more than we need in acss.
	return value;
};
