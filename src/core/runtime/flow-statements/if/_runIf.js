const _runIf = (parsedStatement, originalStatement, ifObj) => {
	// Substitute any variables dynamically so they have the correct values at the point of evaluation and not earlier.
	let { obj, otherObj, varScope } = ifObj;

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str: parsedStatement,
			func: 'Var',
			obj,
			varScope
		}
	);
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			varScope
		},
		strObj.ref
	);

	// Lastly, handle any {$STRING} value from ajax content if it exists.
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			o: otherObj,
			varScope
		},
		strObj.ref
	);

	// Output the variables for real from the map.
	let readyStatement = _resolveVars(strObj.str, strObj.ref);

	// Finally, remove any line breaks, otherwise things will barf when evaluated.
	readyStatement = readyStatement.replace(/\r|\n/gm, '');
	
	let res;
	try {
		res = Function('scopedProxy, ifObj, _runAtIfConds, escapeHTML, unEscapeHTML', '"use strict";return (' + readyStatement + ');')(scopedProxy, ifObj, _runAtIfConds, escapeHTML, unEscapeHTML);		// jshint ignore:line
	} catch (err) {
		console.log('Active CSS error: Error in evaluating @if statement, "' + originalStatement + '", check syntax.');
		console.log('Internal expression evaluated: ' + readyStatement, 'error:', err);
	}

	return res;
};
