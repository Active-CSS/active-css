// Store the rendered location of the attribute for quick DOM lookup when state changes. It doesn't have wrapping comments so it needs an extra reference location.
// This doesn't do a set-attribute. This is done before the attribute is set.
const _addScopedAttr = (wot, o, originalStr, walker, scopeRef) => {
	let cid = _addScopedCID(wot, o.secSelObj, scopeRef);
	let attrName = o.actVal.split(' ')[0];
	let str = (!walker) ? originalStr.substr(originalStr.indexOf(' ') + 1)._ACSSRepQuo() : originalStr;
	_set(scopedData, wot + '.attrs[' + cid + ']' + attrName, str);
};
