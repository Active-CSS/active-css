String.prototype._ACSSCapitalizeAttr = function() {
	return this.replace(/(^|[\s-])\S/g, function (match) {
		return match.toUpperCase();
	});
};
