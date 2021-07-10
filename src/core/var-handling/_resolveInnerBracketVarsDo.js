const _resolveInnerBracketVarsDo = str => {
	if (str.indexOf('scopedProxy.') === -1) return str;
	if (str.startsWith('scopedProxy.')) {
		throw 'ACSS internal error: _resolveInnerBracketVarsDo var should not start with "scopedProxy.". Please report error in GitHub issues.';
	}
	let escStr = _escInQuo(str, 'scopedProxy\\.', '__ACSSScopedP');
	if (escStr.indexOf('scopedProxy.') === -1) return str;
	escStr = _escInQuo(escStr, '[', '__ACSSOpSq');
	escStr = _escInQuo(escStr, ']', '__ACSSClSq');

	let newStr = recursInnerScoped(escStr);

	newStr = newStr.replace(/__ACSSScopedP/g, 'scopedProxy.');
	newStr = newStr.replace(/__ACSSOpSq/g, '[');
	newStr = newStr.replace(/__ACSSClSq/g, ']');

	return newStr;
};

const recursInnerScoped = str => {
	// Get a full inner-scoped value, with a further inner-scoped value and return the valuated result in string form.
	// If it finds an inner-scoped value, it calls this function again until there is no further inner scoped variable.
	let sc = 'scopedProxy.';
	let startPos = str.indexOf(sc, 1);
	let newBeginning = str.substr(0, startPos);

	let rest = str.substr(startPos);
	let restStartPos = rest.indexOf(sc, 1);

	if (restStartPos !== -1) {		// Note, we don't want to check for a fully scoped variable at the beginning of the string, as we know that.
		// There is a further scoped variable to evaluate.
		rest = recursInnerScoped(rest);
	}

	// From here we have the potential for fully evaluating a scopedVariable. There are no inner scoped variable present.
	// There may be extra closing square brackets that we don't need in the "rest" variable.
	// The result should either be a string or a number (I think anyway - can you even have boolean indexes? Probably - anyway, that won't be supported doing it like this).
	// Eg. scopedProxy.main.cheese[0][0]].desc][0].blah]] needs to extract "scopedProxy.main.cheese[0][0]"
	// Eg. scopedProxy.main.winner['hi'].desc] needs to extract "scopedProxy.main.winner['hi'].desc"
	// Eg. scopedProxy.main.cheese] needs to extract "scopedProxy.main.cheese"
	// Eg. scopedProxy.main.cheese[0][1]] needs to extract "scopedProxy.main.cheese[0][1]"
	// Extract everything up to the first unbalanced closing bracket to get the variable to evaluate and have the rest as the remainder.

	// Split by closing bracket. As we loop through, when we don't get an opening bracket in the array item then we know we've got it all.
	let closArr = rest.split(/\]/gm);
	let closArrLen = closArr.length;
	let variable = '', finished = false;
	let remainder = '';
	for (let i = 0; i < closArrLen; i++) {
		let checkStr = closArr[i];
		if (finished) {
			remainder += ']' + checkStr;
		} else {
			variable += checkStr;
			if (!/\[/.test(checkStr)) {
				finished = true;
			} else {
				variable += ']';
			}
		}
	}
	// Evaluate variable - will be quick as it's fully scoped already.
	let scoped = _getScopedVar(variable), res;
	if (typeof scoped.val === 'string') {
		// Return the value in quotes.
		res = '"' + scoped.val + '"';
	} else if (typeof scoped.val === 'number') {
		// Return the value as it is.
		res = scoped.val;
	} else {
		throw 'Active CSS error: Could not evaluate ' + variable;
	}

	return newBeginning + res + remainder;
};
