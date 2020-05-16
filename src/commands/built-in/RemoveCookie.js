_a.RemoveCookie = o => {
	// eg. remove-cookie: cookieName "\blah" "\sdfkjh";	// No spaces are present except between the optional parameters.
	let spl = o.actVal.split(' ');
	if (!spl[0]) return false;
	spl[1] = (spl[1]) ? spl[1]._ACSSRepQuo() : null;
	spl[2] = (spl[2]) ? spl[2]._ACSSRepQuo() : null;
	let cookieStr = encodeURIComponent(spl[0]) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (spl[1] ? "; path=" + spl[1] : "") + (spl[2] ? "; domain=" + spl[2] : "");
	document.cookie = cookieStr;
	return true;
};
