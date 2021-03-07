const _resolveVars = (str, varReplacementRef) => {
 	if (varReplacementRef === -1 || typeof resolvingObj[varReplacementRef] === 'undefined') return str;
	let regex = new RegExp('__acss' + UNIQUEREF + '_(\\d+)_(\\d+)_', 'gm');
	str = str.replace(regex, function(_, ref, subRef) {
		return (typeof resolvingObj[ref] !== 'undefined' && typeof resolvingObj[ref][subRef] !== 'undefined') ? resolvingObj[ref][subRef] : _;
	});
	// Clean-up
	delete resolvingObj[varReplacementRef];

	// Return the fully resolved string - all variable content should now be substituted in correctly.
	return str;
};
