const _warn = (str, o, ...args) => {
	if (DEVCORE) {
		_errDisplayLine('Active CSS error warning', str, [ 'color: green' ], o, args);	// jshint ignore:line
	}
};
