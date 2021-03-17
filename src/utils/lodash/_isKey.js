/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
*/

const _isKey = (value, object) => {
	if (isArray(value)) return false;
	var type = typeof value;
//	if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) return true;	// don't need symbol support in acss.
	if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null) return true;
	return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (object != null && value in Object(object));
};
