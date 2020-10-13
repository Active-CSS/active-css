// This function is incomplete and mentioned in an outstanding ticket.
ActiveCSS._nodeMutations = function(mutations) {
	mutations.forEach(mutation => {
		if (mutation.type == 'childList' && mutation.removedNodes) {
			mutation.removedNodes.forEach(nod => {
				let activeID = nod.acssActiveID;

				idMap.splice(idMap.indexOf(nod), 1);
				varInStyleMap.splice(varInStyleMap.indexOf(activeID), 1);
			});
		}
	});
};
