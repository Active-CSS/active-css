const _ajaxCallbackErr = (str, resp, o) => {
	if (!o.preGet) {
		o.error = true;
		o.errorCode = resp;
		_ajaxCallback(str, o);
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax callback error debug: failed with error "' + resp + '".');
		}
	} else {
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax-pre-get callback error debug: failed with error "' + resp + '".');
		}
	}
};
