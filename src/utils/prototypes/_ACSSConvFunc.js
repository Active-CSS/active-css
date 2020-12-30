String.prototype._ACSSConvFunc = function() {
	// Note - this is used for both conditionals and commands, so we don't add the "_a" or "_c" at the beginning.
	// Mustn't convert starting with "--".
	return (this.startsWith('--')) ? this : this._ACSSCapitalizeAttr().replace(/\-/g, '');
};
