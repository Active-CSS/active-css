String.prototype._ACSSSpaceQuoIn = function() {
	let str = this.replace(/"(.+?)"/g, function(_, innards) {
		innards = '"' + innards.replace(/ /g, '_ACSS_space') + '"';
		return innards;
	});
	return str;
};
