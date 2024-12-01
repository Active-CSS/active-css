const _setCSSVariable = o => {
	let cssVarName = o.func;

	if (o.func.indexOf('{') !== -1) {
		let strObj = _handleVars([ 'expr', 'attrs', 'strings', 'scoped' ],
			{
				str: o.func,
				func: '_setCSSVariable',
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope: o.varScope
			}
		);
		cssVarName = _resolveVars(strObj.str, strObj.ref, o.func);
	}

	if (o.origSecSel == ':root') {
		o.secSelObj.documentElement.style.setProperty(cssVarName, o.actVal);
	} else {
		o.secSelObj.style.setProperty(cssVarName, o.actVal);
	}
};
