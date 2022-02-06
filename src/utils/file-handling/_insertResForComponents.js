const _insertResForComponents = (obj, typ, str) => {
	let ref = obj.getAttribute('data-ref');
	if (compPending[ref] === undefined) compPending[ref] = '';
	compPending[ref] += (compPending[ref] != '' ? "\n" : '' ) + (typ.startsWith('css') ? '<style>' + str + '</style>' : str);
};
