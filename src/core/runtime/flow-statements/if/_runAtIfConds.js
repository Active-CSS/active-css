const _runAtIfConds = (condName, ifObj, str) => {
	// This is run during @if statement evaluation.
	// ifObj is set in _handleIf and passed in at the point of evaluation.
	// condFunc and str are set up in _replaceConditionalsExpr during string preparation before evaluation.
	let { evType, obj, varScope, otherObj, sel, eve, doc, component, compDoc } = ifObj;

	// Set up the conditional contents (the "action command") by unescaping what was escaped earlier.
	// The last two are needed for the comparison of strings without breaking the conditional parser.
	let condVal = str.replace(/__ACSSSingQ/g, '\'').replace(/__ACSSBSlash/g, '\\').replace(/"/g, '__ACSSDBQuote').replace(/ /g, '_ACSSspace');

	let clause = condName + '(' + condVal + ')';

	// Use _passesConditional to be able to use comma-delimited conditionals and custom conditionals - don't call _checkCond directly as it won't
	// cater for everything.

	// Run the conditional clause and return the result for use in the overall evaluation in _handleIf().
	let condObj = {
		el: obj,
		sel,
		clause,
		evType,
		ajaxObj: otherObj,
		doc,
		varScope,
		component,
		eve,
		compDoc
	};

	return _passesConditional(condObj);
};
