_c.IfVar = o => {
	// This caters for scoped variable and also window variable comparison. If the variable isn't in the scope, it takes the window variable if it is there.
	// First parameter is the variable name.
	// Second parameter is a string, number or boolean. Any JavaScript expression ({= ... =} clauses) has already been evaluated.
	// This also takes only one parameter, in which case it is checked for evaluating to boolean true.

	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl = actVal.split(' ');
	let compareVal, varName;
	varName = spl.shift();	// Remove the first element from the array.

	compareVal = spl.join(' ')._ACSSSpaceQuoOut();
	compareVal = (compareVal == 'true') ? true : (compareVal == 'false') ? false : compareVal;
	let scoped = _getScopedVar(varName, o.varScope);
	let varValue = scoped.val;

	if (typeof compareVal !== 'boolean') {
		if (typeof compareVal == 'string' && compareVal.indexOf('"') === -1) {
			if (_isArray(varValue)) {
				if (compareVal == '') {
					// Nothing to compare, return whether this value to check is a populated array.
					return (varValue.length > 0) ? true : false;
				}
			} else {
				if (compareVal == '') {
					// Nothing to compare, return whether this value equates to true.
					return (varValue) ? true : false;
				}
				compareVal = Number(compareVal._ACSSRepQuo());
			}
		} else {
			if (_isArray(varValue)) {
				try {
					// Convert compare var to an array.
					compareVal = JSON.stringify(JSON.parse(compareVal));
					// Stringify allows us to compare two arrays later on.
					varValue = JSON.stringify(varValue);
				} catch(err) {
					// If there's an error, it's probably because the comparison didn't convert to an array, so it doesn't match.
					return false;
				}
			} else {
				compareVal = compareVal._ACSSRepQuo();
			}
		}
	}

	return (typeof varValue == typeof compareVal && varValue == compareVal);
};
