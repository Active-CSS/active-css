_a.SetCookie = o => {
	//	Eg. set-cookie: cookieName "any string with spaces" secs/infinity/"date" "\blah" "\sdfkjh" true;
	let aV = o.actVal;
	//	1. Replace escaped quotes for now.
	aV = aV.replace(/\\\"/g, '_ACSS_escaped_quote');
	//	2. Fill in the spaces between quotes with an alternate space string, and remove the quotes if we can.
	aV = aV._ACSSSpaceQuoIn();
	//	3. Put the escaped quotes back.
	aV = aV.replace(/_ACSS_escaped_quote/g, '\\\"');
	//	4. Split the array by space.
	let arr = aV.split(' ');
	//	5. 0 element is name.
	//	6. 1 element gets spaces put back in, quotes removed and assigned as value.
	arr[1] = (arr[1]) ? arr[1]._ACSSSpaceQuoOut()._ACSSRepQuo() : '';
	//	7. 2 element gets spaces put back in, quotes removed and if number is seconds, if infinity is infinity, otherwise string date, or empty.
	arr[2] = (arr[2]) ? arr[2].replace(/_ACSS_space/g, ' ')._ACSSRepQuo() : '';
	arr[2] = (arr[2] == 'Infinity') ? Infinity : (arr[2] == 'Year') ? 31536e3 : (/^[0-9e]+$/.test(arr[2])) ? +arr[2] : arr[2];
	//	8. 3 element if there is path.
	arr[3] = (arr[3]) ? arr[3]._ACSSRepQuo() : null;
	//	9. 4 element if there is domain.
	arr[4] = (arr[4]) ? arr[4]._ACSSRepQuo() : null;
	//	10. 5 element if there is secure.
	arr[5] = (arr[5] == 'true') ? true : (arr[5] == 'false') ? false : null;
	if (arr[2] == 'true' && !arr[3] && !arr[4] && !arr[5]) {
		arr[2] = null; arr[5] = true;
	}
	if (arr[2] == 'false' && !arr[3] && !arr[4] && !arr[5]) {
		arr[2] = null; arr[5] = false;
	}
	if (arr[3] == 'true' && !arr[4] && !arr[5]) {
		arr[3] = null; arr[5] = true;
	}
	if (arr[3] == 'false' && !arr[4] && !arr[5]) {
		arr[3] = null; arr[5] = false;
	}
	if (arr[4] == 'true' && !arr[5]) {
		arr[4] = null; arr[5] = true;
	}
	if (arr[4] == 'false' && !arr[5]) {
		arr[4] = null; arr[5] = false;
	}
	if (!_setCookie(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5])) console.log('set-cookie ' + arr[0] + ' failed');
};
