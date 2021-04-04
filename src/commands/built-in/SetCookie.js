/*	From MDN.
Set-Cookie: <cookie-name>=<cookie-value> 
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None
*/

_a.SetCookie = o => {
	// Example syntax (double-quotes are optional everywhere for this command):
	// set-cookie: name("name") value("value") expires("date") maxAge("non-zero-digit") domain("domain") path("path") secure httponly sameSite("strict/lax/none");

	let aV = o.actVal, cookieName, cookieValue, expires, maxAge, cookieDomain, cookiePath, httpOnly, secure, secureIfHttps, sameSite;

	//	Replace escaped quotes.
	aV = aV.replace(/\\\"/g, '_ACSS_escaped_quote');
	//	Fill in the spaces between quotes with an alternate space string, and remove the quotes.
	aV = aV._ACSSSpaceQuoIn();
	//	Put the escaped quotes back. This gives us a true space delimited string of options that can be split later on.
	aV = aV.replace(/_ACSS_escaped_quote/g, '\\\"');

	// Cookie name.
	cookieName = encodeURIComponent(_getParVal(aV, 'name')._ACSSRepQuo());

	// Cookie value.
	cookieValue = encodeURIComponent(_getParVal(aV, 'value')._ACSSSpaceQuoOut()._ACSSRepQuo());

	// Expires.
	expires = _getParVal(aV, 'expires')._ACSSSpaceQuoOut()._ACSSRepQuo();
	if (expires == 'Infinity') {
		expires = 'Fri, 31 Dec 9999 23:59:59 GMT';	// After 8000 years that user will be forced to refresh his browser.
	} else {
		let attemptToGetDate = _getPastFutureDate(expires);
		// JavaScript has no date validity function, and alternatives will bloat the core.
		// If it's not in the right format by the developer, we must assume that it's a specific thing that the developers wants to be set.
		expires = (attemptToGetDate instanceof Date) ? attemptToGetDate.toUTCString() : expires;
	}

	// Max-Age.
	maxAge = _getParVal(aV, 'maxAge')._ACSSRepQuo();
	if (maxAge) {
		let numTest = new RegExp('^\\d+$');
		if (!numTest.test(maxAge)) console.log('Active CSS error: set-cookie maxAge is not a number.');
	}

	// Domain.
	cookieDomain = _getParVal(aV, 'domain')._ACSSRepQuo();

	// Path
	cookiePath = _getParVal(aV, 'path')._ACSSRepQuo();

	// SameSite
	sameSite = _getParVal(aV, 'sameSite')._ACSSCapitalize()._ACSSRepQuo();

	// Split the array by space.
	let arr = aV.split(' ');

	// HttpOnly.
	httpOnly = _optDef(arr, 'httponly', true, false);

	// Secure/secureIfHttps
	secureIfHttps = _optDef(arr, 'secureIfHttps', true, false);
	if (secureIfHttps) {
		secure = (window.location.protocol == 'https:');
	} else {
		secure = _optDef(arr, 'secure', true, false);
	}

	let str = `${cookieName}=${cookieValue};`;
	str += expires ? ` Expires=${expires};` : '';
	str += maxAge ? ` Max-Age=${maxAge};` : '';
	str += cookieDomain ? ` Domain=${cookieDomain};` : '';
	str += cookiePath ? ` Path=${cookiePath};` : '';
	str += secure ? ' Secure;' : '';
	str += sameSite ? ` SameSite=${sameSite};` : '';
	str += httpOnly ? ' HttpOnly;' : '';

	str = str._ACSSSpaceQuoOut();

	document.cookie = str;
};
