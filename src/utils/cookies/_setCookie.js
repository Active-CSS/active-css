/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _setCookie = (nam, sValue, vEnd, sPath, sDomain, bSecure, bSameSite, bHttpOnly) => {
	if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
	var sExpires = '';
	if (vEnd) {
		switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
				break;
			case String:
				sExpires = '; expires=' + vEnd;
				break;
		}
	}
	document.cookie = encodeURIComponent(nam) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; Secure' : '') + (bSameSite ? '; samesite=' + bSameSite : '' + (bHttpOnly ? '; HttpOnly' : ''));
	return true;
};
