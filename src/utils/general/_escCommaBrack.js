function _escCommaBrack(str, o) {
	/**
	 * This function is used in splitting up the action value by comma. It escapes the real split commas to _ACSSComma which is then handled in _performActionDo.
	 *
	 * "o" is used for reporting on any failing line in the config.
	 * There is no recursive facility like there is in PCRE for doing the inner bracket recursion count, so doing it manually as the string should be relatively
	 * small in pretty much all cases.
	 * Here is an old-school method unless someone has a better idea. Though when JavaScript finally gets a recursive option, it can be converted to a regex.
	 * String could be this (note the double enclosure - there could be many enclosure levels), so it needs to work in all cases:
	 * player "X",gameState ['', '', ''],roundDraw false,winners [[0, 1, 2],[3, [2, 3, 4], 4, 5],[6, 7, 8],[0, 4, 8],[2, 4, 6]],testvar ",[,],",testvar2 ',[,],'
	 * It needs to convert to this:
	 * player "X",gameState [''__ACSScom ''__ACSScom ''],roundDraw false,winners [[0__ACSScom 1__ACSScom 2]__ACSScom[3__ACSScom [2__ACSScom 3__ACSScom 4]__ACSScom 4__ACSS
com 5]__ACSScom[6__ACSScom 7__ACSScom 8]__ACSScom[0__ACSScom 4__ACSScom 8]__ACSScom[2__ACSScom 4__ACSScom 6]],testvar "__ACSScom[__ACSScom]__ACSScom",testvar2 '__ACSS
com[__ACSScom]__ACSScom'
	 * Easy solution:
	 * 1. Escape any commas in quotes or double quotes.
	 * 2. Split the array by comma.
	 * 3. Iterate the array.
	 * 4. Count the number of brackets, curlies and parentheses in any one item.
	 * 5. If the balance count does not equal or has not resolved to 0, then add the array item plus an escaped comma, to the new string. Otherwise add a real comma.
	 * 6. Carry the balance count over and repeat from 3.
	 * 8. Put back any escaped quotes.
	 * 9. Do any final replacements for the looping of the o.actVal.
	 * 10. Return the new string.
	*/

	// Replace escaped double quotes.
	str = str.replace(/\\\"/g, '_ACSS_i_dq');
	// Replace escaped single quotes.
	str = str.replace(/\\'/g, '_ACSS_i_sq');
	// Ok to this point.
	let mapObj = {
		'\\,': '__ACSS_int_com',	// Escaping is needed so the items work in the regex as search items and not regex operators.
		'\\(': '_ACSS_i_bo',
		'\\)': '_ACSS_i_bc',
		'\\{': '_ACSS_i_co',
		'\\}': '_ACSS_i_cc',
		'\\[': '_ACSS_i_so',
		'\\]': '_ACSS_i_sc'
	};
	let mapObj2 = {
		',': '__ACSS_int_com',
		'(': '_ACSS_i_bo',
		')': '_ACSS_i_bc',
		'{': '_ACSS_i_co',
		'}': '_ACSS_i_cc',
		'[': '_ACSS_i_so',
		']': '_ACSS_i_sc'
	};
	str = str.replace(INQUOTES, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards, mapObj2);
	});
	str = str.replace(INSINGQUOTES, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards, mapObj2);
	});
	let strArr = str.split(','), balanceCount = 0, newStr = '', item;
	for (item of strArr) {
		balanceCount += item.split('[').length - item.split(']').length;
		balanceCount += item.split('(').length - item.split(')').length;
		balanceCount += item.split('{').length - item.split('}').length;
		newStr += (balanceCount !== 0) ? item + '__ACSS_int_com' : item + ',';
	}
	if (balanceCount !== 0) {
		// Syntax error - unbalanced expression.
		newStr = _escCommaBrackClean(newStr);
		newStr = newStr.replace(/__ACSS_int_com/g, ',');
		_err('Unbalanced JavaScript equation in var command - too many brackets, curlies or parentheses, or there could be incorrectly escaped characters: ' + newStr, o);
		return newStr;
	} else {
		// Remove the last comma
		newStr = newStr.slice(0, -1);
		// Set up the correct formatting for looping the o.actVal.
		newStr = newStr.replace(/\,/g, '_ACSSComma');

	}
	newStr = _escCommaBrackClean(newStr);

	return newStr;
}

function _escCommaBrackClean(str) {
	// A simple reverse of the object won't give use the regex options we want, so just do a new replace object.
	let mapObj = {
		'_ACSS_i_dq': '\\"',
		'_ACSS_i_sq': "\\'",
		'__ACSS_int_com': ',',
		'_ACSS_i_bo': '(',
		'_ACSS_i_bc': ')',
		'_ACSS_i_co': '{',
		'_ACSS_i_cc': '}',
		'_ACSS_i_so': '[',
		'_ACSS_i_sc': ']'
	};

	let newStr = ActiveCSS._mapRegexReturn(mapObj, str);

	return newStr;
}
