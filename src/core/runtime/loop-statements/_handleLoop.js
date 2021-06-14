const _handleLoop = (loopObj) => {
	let { currentLoop, varScope } = loopObj;

	// Which type of loop is it?
	let command = _getLoopCommand(currentLoop);
	let scopePrefix = ((varScope && privVarScopes[varScope]) ? varScope : 'main') + '.';

	switch (command) {
		case '@each':
			_handleEach(loopObj, scopePrefix);
			break;

		case '@for':
			_handleFor(loopObj, scopePrefix);
			break;
	}
};
