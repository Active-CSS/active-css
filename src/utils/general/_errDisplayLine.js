const _errDisplayLine = (pref, message, errStyle, o, argsIn) => {	// jshint ignore:line
	if (o) {
		message = pref + ', ' + message + ' --> "' + o.actName + ': ' + o.actVal + ';"';
		message += (o.file.startsWith('_inline_')) ? '    (inline ACSS)' : '    (line ' + o.line + ', file: ' + o.file + ')';
		console.log('%c' + message, errStyle);
		if (argsIn.length > 0) {
			let newArgs = ['More info:', ...argsIn];
			let args = Array.prototype.slice.call(newArgs);
			console.log.apply(console, args);
		}
		console.log('Target:', o);
		console.log('Config:', config);
		console.log('Variables:', scopedOrig);
		if (conditionals.length > 0) console.log('Conditionals:', conditionals);
		if (components.length > 0) console.log('Components:', components);
	} else {
		console.log('%c' + pref + ', ' + message, errStyle);
	}
};
