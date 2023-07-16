const _handleWhile = (loopObj, scopePrefix) => {
	let { fullStatement, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// First, remove @while clause.
	let statement = fullStatement;
	statement = statement.substr(7).trim();

	// Now that the loop is set up, pass over the necessary variables into the recursive while function.
	let itemsObj = {
		loopObj,
		fullStatement,
		statement,
		existingLoopRef,
		scopePrefix,
	};

	_handleWhileItem(itemsObj, 0);
};
