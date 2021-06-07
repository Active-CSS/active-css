const _addConfigError = (str, o) => {
	// Wipe any existing action commands after await, if await was used.
	_syncEmpty(o._subEvCo);

	// Needs an error handling.
	_handleEvents({ obj: o.obj, evType: 'loadconfigerror', eve: o.e });
};
