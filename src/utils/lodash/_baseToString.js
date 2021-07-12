/**
* The base implementation of `_.toString` which doesn't convert nullish
* values to empty strings.
*
* @private
* @param {*} value The value to process.
* @returns {string} Returns the string.
*/
const _baseToString = value => {
	// Exit early for strings to avoid a performance hit in some environments.
	if (typeof value == 'string') return value;
	if (_isArray(value)) return _arrayMap(value, _baseToString) + '';	// Recursively convert values (susceptible to call stack limits).
//	if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : '';	// don't need symbol support in acss.
	var result = (value + '');
	return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
};
