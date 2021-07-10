/**
 * Checks if a cookie exists.
 * (Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework)
 *
 * Called by:
 *	IfCookieEquals()
 *	IfCookieExists()
 *
 * Side-effects:
 *	None
 *
 * @private
 * @param {String} nam: The name of the cookie to check existence of.
 *
 * @returns {Boolean} Returns if the cookie exists or not.
 */
const _cookieExists = nam => {
    if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
   	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};
