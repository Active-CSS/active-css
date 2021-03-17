/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
	ACSS = modded to remove symbol references as it isn't needed.
*/
const _toKey = (value) => {
//	if (typeof value == 'string' || isSymbol(value)) return value;	// don't need symbol support in acss.
	if (typeof value == 'string') return value;
	var result = (value + '');
	return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
};
