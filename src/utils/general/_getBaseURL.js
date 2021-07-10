/**
 * Takes in a full URL or string and returns everything up to the "?" if it exists
 *
 * Called by:
 *	_a.LoadScript()
 *	ActiveCSS.init()
 *	_addActValRaw()
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} str: String containing full URL.
 *
 * @returns the string before the "?" or the original string if there is no "?"
 */
const _getBaseURL = str => {
	let pos = str.indexOf('?');
	return (pos !== -1) ? str.substr(0, str.indexOf('?')) : str;
};
