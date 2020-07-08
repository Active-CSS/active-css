// Store the rendered location for quick DOM lookup when state changes. We need this for both content and attribute rendering.
const _addScopedCID = (wot, obj, scopeRef) => {
	let cid = _getActiveID(obj);
	_set(scopedData, wot + '.cids[' + cid + ']', { cid, scopeRef } );
	return cid;
};
