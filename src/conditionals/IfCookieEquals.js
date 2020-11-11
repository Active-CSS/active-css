_c.IfCookieEquals = o =>  {
	let spl = o.actVal.split(' ');
	if (!_cookieExists(spl[0])) return false;
	let nam = spl[0];
	spl.shift();
	spl = spl.join(' ');
	return (_getCookie(nam) == spl._ACSSRepQuo());
};
