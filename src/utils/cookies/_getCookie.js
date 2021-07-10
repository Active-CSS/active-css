/**
 * Gets the cookie value.
 * (Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework)
 *
 * Called by:
 *	IfCookieEquals
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} nam The name of the cookie to check existence of.
 *
 * @returns {Null} when the cookie doesn't exist.
 * @returns {String} Returns the value of the cookie or null.
 */
const _getCookie = nam => {
	if (!nam) return null;
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
};
