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
	if (typeof compareVal !== 'boolean') {
		if (typeof compareVal == 'string' && compareVal.indexOf('"') === -1) {
			compareVal = Number(compareVal._ACSSRepQuo());
		} else {
			compareVal = compareVal._ACSSRepQuo();
		}
	}
	let scoped = _getScopedVar(varName, o.varScope);
	let varValue = scoped.val;

	return (typeof varValue == typeof compareVal && varValue == compareVal);
};
