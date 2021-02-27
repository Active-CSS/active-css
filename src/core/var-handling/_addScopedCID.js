// Store the rendered location for quick DOM lookup when state changes. We need this for both content and attribute rendering.
const _addScopedCID = (wot, obj, scopeRef) => {
	let cid = _getActiveID(obj);
	if (typeof _get(scopedData, wot) === 'undefined') {
		_set(scopedData, wot, []);
	}
	return cid;
};
