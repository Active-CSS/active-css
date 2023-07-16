const _runIf = (parsedStatement, originalStatement, ifObj, loopObj) => {
	// Substitute any variables dynamically so they have the correct values at the point of evaluation and not earlier.
	let { obj, otherObj, varScope, _subEvCo, _subSubEvCo, _targCo } = ifObj;

	let loopRef = loopObj.loopRef || '';

	// Handle pause resumption.
	let runIndex = loopRef + loopObj._condCo + '_' + _subSubEvCo + '_' + _targCo;

	if (condTrack[_subEvCo]) {
		if (condTrack[_subEvCo].condResArr[runIndex] !== undefined) {		// This undefined is definitely needed to resume correctly.
			let trackRes = condTrack[_subEvCo].condResArr[runIndex];
			loopObj._condCo++;
			return trackRes;
		}
	}

	// Attributes get evaluated first. This is so that we can evaluate things like $cheese{@data-num}, which is really useful.
	let strObj = _handleVars([ 'attrs' ],
		{
			str: parsedStatement,
			func: 'Var',
			obj,
			varScope
		}
	);

	// Output the variables for real from the map.
	let readyStatement = _resolveVars(strObj.str, strObj.ref);

	strObj = _handleVars([ 'rand', 'expr', 'scoped' ],
		{
			str: readyStatement,
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
	readyStatement = _resolveVars(strObj.str, strObj.ref);

	// Finally, remove any line breaks, otherwise things will barf when evaluated.
	readyStatement = readyStatement.replace(/\r|\n/gm, '');

	let res;
	try {
		res = Function('scopedProxy, ifObj, _runAtIfConds, escapeHTML, unEscapeHTML, getVar', '"use strict";return !!(' + readyStatement + ');')(scopedProxy, ifObj, _runAtIfConds, escapeHTML, unEscapeHTML, getVar);                                // jshint ignore:line
	} catch (err) {
		console.log('Active CSS error: Error in evaluating @if statement, "' + originalStatement + '", check syntax.');
		console.log('Internal expression evaluated: ' + readyStatement, 'error:', err);
	}

	if (!condTrack[_subEvCo]) {
		condTrack[_subEvCo] = [];
		condTrack[_subEvCo].condResArr = [];
	}
	condTrack[_subEvCo].condResArr[runIndex] = res;
	loopObj._condCo++;

	return res;
};
