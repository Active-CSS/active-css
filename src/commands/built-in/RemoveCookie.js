_a.RemoveCookie = o => {
	// Only cookie name, path & domain for this command. Command syntax structured in the same way as set-cookie for consistency.

	// Eg. remove-cookie: name("cookieName") path("/") domain("sdfkjh.com");

	// Double-quotes are optional for the syntax.
	let aV = o.actVal._ACSSRepAllQuo(), cookieName, cookieDomain, cookiePath, str;

	// Cookie name.
	cookieName = encodeURIComponent(_getParVal(aV, 'name'));

	// Domain.
	cookieDomain = _getParVal(aV, 'domain');

	// Path
	cookiePath = _getParVal(aV, 'path');

	str = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
	str += cookieDomain ? ` domain=${cookieDomain};` : '';
	str += cookiePath ? ` path=${cookiePath};` : '';

	document.cookie = str;
};
