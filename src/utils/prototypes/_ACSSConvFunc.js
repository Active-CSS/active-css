String.prototype._ACSSConvFunc = function() {
	// Note - this is used for both conditionals and commands, so we don't add the "_a" or "_c" at the beginning.
	return this._ACSSCapitalizeAttr().replace(/\-/g, '');
};
