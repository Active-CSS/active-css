const _errDisplayLine = (pref, message, errStyle, o, argsIn) => {	// jshint ignore:line
	let newArgs, args;
	if (argsIn.length > 0) {
		newArgs = ['More info:', ...argsIn];
		args = Array.prototype.slice.call(newArgs);
	}
	message = '%c' + pref + ', ' + message;
	if (o) {
		message += ' --> "' + (o.actName || '') + ': ' + o.actVal + ';"';
		if (o.file) message += (o.file && o.file.startsWith('_inline_')) ? '    (embedded ACSS)' : '    ((line ' + o.line + ', file: ' + o.file + ')';
	}
	console.log(message, errStyle);
	if (args) console.log.apply(console, args);
	if (o) console.log('Target:', o);
	console.log('Config:', config);
	console.log('Variables:', scopedOrig);
	if (conditionals.length > 0) console.log('Conditionals:', conditionals);
	if (components.length > 0) console.log('Components:', components);
};
