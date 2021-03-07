const _replaceRand = (sel, varReplacementRef=-1) => {
	if (sel.indexOf('{$RAND}') !== -1) {
		let rand = Math.floor(Math.random() * 10000000);
		sel = sel.replace(/\{\$RAND\}/g, rand);
	}
	return sel;
};
