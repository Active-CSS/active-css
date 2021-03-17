const _recursiveScopeCleanUp = nod => {
	let ID;
	nod.querySelectorAll('*').forEach(function (obj, index) {
		ID = obj._acssActiveID;
		if (ID) {
			_deleteIDVars(ID);
			_deleteScopeVars('_' + ID.substr(3));
		}
		if (supportsShadow && obj.shadowRoot) {
			_recursiveScopeCleanUp(obj.shadowRoot);
		}
	});
};
