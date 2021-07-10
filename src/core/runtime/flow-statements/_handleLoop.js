const _handleLoop = (loopObj) => {
	let { fullStatement, varScope, atIfDetails, _imStCo } = loopObj;

	// Sort out the scope here as it doesn't need doing multiple times from inside the loop (if it is a loop).
	let scopePrefix = ((varScope && privVarScopes[varScope]) ? varScope : 'main') + '.';

	let statement = atIfDetails.name; 

	if (statement) {
		switch (statement) {
			case '@else':
			case '@else if':
				// If we've already run a successful if statement, then don't run any more.
				if (loopObj.previousIfRes && loopObj.previousIfRes.res === true) return;		// jshint ignore:line
				// If it gets this far, continue with checking and running the if clause.

			case '@if':
				loopObj.ifRes = _handleIf(loopObj, statement);
				break;

			case '@each':
				_resetContinue(_imStCo);
				_handleEach(loopObj, scopePrefix);
				break;

			case '@for':
				_resetContinue(_imStCo);
				_handleFor(loopObj, scopePrefix);
				break;

			case '@while':
				_handleWhile(loopObj);
				break;
		}
	}
};
