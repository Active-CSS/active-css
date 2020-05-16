const _replaceStringVars = (o, str) => {
	// This function should always only be run more once and always after any attribute or variable substitution has taken place, otherwise the content may get
	// changed, leading to unpredictable results or injection.
	return str.replace(/{\$STRING\}/gi, ((o && o.res) ? o.res : ''));
};
