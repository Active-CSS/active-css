_a.Open = o => {
	// This mimics the JS syntax for window.open().
	// JS: window.open("https//active.org", "_blank", "popup,noreferrer");
	// ACSS: open: "https//active.org" "_blank" "popup,noreferrer"
	// Split the action value into sections, with a maximum of three. Each section must have surrounding double-quotes.
	let openObj = [];
	let preStr = o.actVal.replace(/\\"/g, '_ACSS_tmpquote');
	let str = preStr.replace(INQUOTES, function(_, innards) {
		let newStr = innards._ACSSRepQuo().replace(/_ACSS_tmpquote/g, '\"');
		openObj.push(newStr);
		return '';
	});
	window.open(openObj[0], openObj[1], openObj[2]);
};
