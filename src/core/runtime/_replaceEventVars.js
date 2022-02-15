const _replaceEventVars = (sel, obj) => {
	let str = ActiveCSS._sortOutFlowEscapeChars(sel);
	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			str,
			obj
		}
	);
	strObj = _handleVars([ 'strings', 'scoped', 'html' ],
		{
			str: strObj.str,
		},
		strObj.ref
	);
	return _resolveVars(strObj.str, strObj.ref);
};
