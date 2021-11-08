String.prototype._ACSSRepQuo = function() {
	var html = this.replace(/\\"/g, '_ACSS*%%_');
	html = html.replace(/(^")|("$)/g, '');
	html = html.replace(/_ACSS\*%%_/g, '"');
	return html;
};
