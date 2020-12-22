const _resolveDynamicIframes = (iframes, o) => {
	o.doc.querySelectorAll('data-acss-iframe').forEach(function(obj) {	// jshint ignore:line
		_resolveDynamicIframesDo(obj, iframes);
	});
};
