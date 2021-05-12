const _resolveVars = (str, varReplacementRef, func='') => {
 	if (varReplacementRef === -1 || typeof resolvingObj[varReplacementRef] === 'undefined') return str;
	let regex = new RegExp('__acss' + UNIQUEREF + '_(\\d+)_(\\d+)_', 'gm');
	str = str.replace(regex, function(_, ref, subRef) {
		let res;
		if (typeof resolvingObj[ref] !== 'undefined' && typeof resolvingObj[ref][subRef] !== 'undefined') {
			res = _escNoVars(resolvingObj[ref][subRef]);
			if (func.startsWith('Render')) {
				// Escape backslashes from variables prior to render.
				res = res.replace(/\\/gm, '____acssEscBkSl');
			}
		}
		return (res) ? res : '';
	});
	// Clean-up
	delete resolvingObj[varReplacementRef];

	// Return the fully resolved string - all variable content should now be substituted in correctly.
	return str;
};
