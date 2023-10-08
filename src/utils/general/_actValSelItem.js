const _actValSelItem = (o, txt) => {
	let str = o.actVal;
	if (txt) {
		// Replace spaces inside any quotes.
		str = o.actVal.replace(INQUOTES, function(_, innards) {
			return innards.replace(/ /g, '_ACSS_avsi_sp');
		});
	}
	// Split the remainder by space and parse out.
	let arr = str.split(' ');
	// Get the last word and on return put back any spaces that were escaped earlier.
	let last = arr.splice(-1);
	let joinedSel = arr.join(' ');
	return txt ? [ joinedSel, last[0].replace(/_ACSS_avsi_sp/g, ' ') ] : [ _getSel(o, joinedSel), last[0] ];
};
