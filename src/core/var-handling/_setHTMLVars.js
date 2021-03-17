const _setHTMLVars = (o, isEmptyStr=false) => {
	let str = (isEmptyStr) ? '' : o.res;
	let escStr = (isEmptyStr) ? '' : _escNoVars(o.res);
	let safeStr = (isEmptyStr) ? '' : _safeTags(o.res);
	let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');

	_set(scopedProxy, compScope + '.__acssHTML', str);
	// Allow no variables to get rendered from this HTML variable type but keep HTML intact.
	_set(scopedProxy, compScope + '.__acssHTML_NOVARS', escStr);
	// Escape HTML and curlies with safe HTML entities.
	_set(scopedProxy, compScope + '.__acssHTML_ESCAPED', safeStr);
};
