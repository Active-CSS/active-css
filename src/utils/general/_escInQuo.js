const _escInQuo = (str, chrRaw, chrRepl) => {
	let chrReg = _escForRegex(chrRaw);
	let replReg = new RegExp(chrReg, 'g');
	str = str.replace(/"(.+?)"/g, function(_, innards) {
		innards = '"' + innards.replace(replReg, chrRepl) + '"';
		return innards;
	});
	return str;
};
