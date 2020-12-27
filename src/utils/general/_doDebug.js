const _doDebug = (typ, primSel) => {
	if (primSel) {
		if (debugMode.indexOf(':') !== -1) {
			let a = primSel.split(':');
			return (debugMode.indexOf(a[0] + ':' + typ) !== -1);
		} else {
			return (debugMode.indexOf(primSel) !== -1 || debugMode.indexOf(typ) !== -1);
		}
	} else {
		if (debugMode.indexOf(':') !== -1) {
			return (debugMode.indexOf(typ) !== -1 && debugMode.indexOf(':') !== debugMode.indexOf(typ) - 1);
		} else {
			return (debugMode.indexOf(typ) !== -1);
		}
	}
};
