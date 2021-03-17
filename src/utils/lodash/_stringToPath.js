/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
*/
//const _stringToPath = _memoizeCapped(function(string) {
const _stringToPath = string => {
	var result = [];
	if (string.charCodeAt(0) === 46 /* . */) result.push('');
	string.replace(rePropName, function(match, number, quote, subString) {
		result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	});
	return result;
};
