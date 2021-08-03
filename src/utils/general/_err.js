const _err = (str, o, ...args) => {	// jshint ignore:line
	// Throw involved error messages when using the development edition, otherwise for security reasons throw a more vague error which can be debugged by
	// using the development edition. If converting for the browser, this would get a special command like "debug-show-messages: true;" or something like
	// that. It is unnecessary to require that for the JavaScript version of the core, as we differentiate between development and production versions.
	if (DEVCORE) {
		_errDisplayLine('Active CSS breaking error', str, [ 'color: red' ], o, args);	// jshint ignore:line
		throw 'error, internal stack trace -->';
	} else {
		throw 'ACSS error: ' + str;
	}
};
