const _extractBracketPars = (actionValue, parArr, o) => {
	// Extracts bracket parameters from an action value and returns an object with separated values.
	// Used in take-class, and designed to be used by others.
	// It can handle inner brackets for selectors with pseudo-selectors like :not().
	// The "o" is only used for reporting errors.
	// actionValue = the full action command value.
	// parArr = an array of parameter names that has content in parentheses, eg. [ 'scope', 'something' ].
	// Example:
	// my-command: .myClass scope(#myScope:not(.cheese)) something(some command string);
	// Should return this: { action: '.myClass', scope: '#myScope:not(.cheese)', something: 'some command string' }

	let newActionValue = actionValue;
	let res = {}, pos, parStartLen, splitRes;

	// Escape any escaped parentheses or in quotes so they don't factor into the parentheses splitting that is about to take place.
	newActionValue = newActionValue.replace(/\\\(/g, '_ACSS_opPa').replace(/\\\)/g, '_ACSS_clPa');
	newActionValue = _escInQuo(newActionValue, '(', '_ACSS_opPa');
	newActionValue = _escInQuo(newActionValue, ')', '_ACSS_clPa');

	parArr.forEach(parName => {
		let trackArr = [];
		while (true) {
			// Note this was further abstracted out, but would have been slower with the char escaping going on above happening within the abstraction,
			// so I put it back to this for the sake of speed.
			let currentActionValue = newActionValue;
			pos = newActionValue.indexOf(parName + '(');
			if (pos !== -1) {
				parStartLen = parName.length + 1;	// Includes name of parameter and first parenthesis.
				newActionValue = currentActionValue.substr(0, pos - 1).trim();		// Strips off the parameters as it goes.
				// Get the parameter value and the remainder of the action value.
				// Send over the action value from the beginning of the parameter value.
				splitRes = _extractBracketParsSplit(currentActionValue.substr(pos + parStartLen), actionValue, o);
				trackArr.push(_extractBracketParsUnEsc(splitRes.value));
				newActionValue += splitRes.remainder;
				// Check for any others.
				continue;
			}
			if (trackArr.length > 0) res[parName] = (trackArr.length == 1) ? trackArr[0] : trackArr;
			break;
		}
	});

	res.action = _extractBracketParsUnEsc(newActionValue);	// The action is what is left after the parameter loop.

	return res;
};

const _extractBracketParsUnEsc = str => {
	return str.replace(/_ACSS_opPa/g, '\\(').replace(/_ACSS_clPa/g, '\\)');
};

const _extractBracketParsSplit = (str, original, o) => {
	// Example of str content:
	// str = "#left) another(#myEl:not(has(something))) hi(and the rest) something"
	// We have already accounted for the opening parenthesis.
	// Return value should be:
	// res.value = "#left";
	// res.remainder = " another(#myEl:not(has(something))) hi(and the rest) something"
	let res = {};
	// Split by "(".
	let openingArr = str.split('(');
	if (openingArr.length == 1) {
		// No "(" found - there should be only one parameter.
		let closingPos = str.indexOf(')');
		if (closingPos === -1) {
			_err('No closing parenthesis found for parameter in action command', o);
		}
		res.value = str.substr(0, closingPos).trim();
		res.remainder = str.substr(closingPos + 1);
	} else {
		let lineCarry = '', line, innerRes, remainderArr;
		let co = 0;
		for (let n = 0; n < openingArr.length; n++) {
			line = openingArr[n];
			co++;
			// Now get the content of this line sorted out.
			innerRes = _extractBracketParsInner(line, co, original, o);
			if (typeof innerRes === 'number') {
				co = co - innerRes;
			} else if (innerRes.value) {
				// We got the variable that we needed.
				res.value = lineCarry + innerRes.value;
				res.remainder = innerRes.remainder;
				if (n < openingArr.length) {
					remainderArr = openingArr.slice(n + 1);
					res.remainder += (typeof remainderArr[0] !== undefined && remainderArr[0] != '' ? '(' : '') + remainderArr.join('(');
				}
				break;
			}
			lineCarry += line + '(';
		}
	}

	return res;
};

const _extractBracketParsInner = (str, numOpening, original, o) => {
	// Split by ')'.
	let closingArr = str.split(')');
	if (closingArr.length - 1 > numOpening) {
		if (o !== undefined) {
			_err('Too many closing parenthesis found in action command', o);
		} else {
			_err('Too many closing parenthesis found in component statement: ' + original);
		}
	} else if (closingArr.length - 1 < numOpening) {
		// Not enough closing parameters. Return the number of closing parameters so they can be accounted for.
		return closingArr.length - 1;
	} else {
		// We have the right number of closing parentheses.
		let res = {};
		res.remainder = closingArr.slice(-1);
		res.value = closingArr.slice(0, -1).join(')');
		return res;
	}
};
