const _addConfigError = (str, o) => {
	// Needs an error handling.
	_handleEvents({ obj: o.obj, evType: 'loadconfigerror' });
};
