/* Takes a variable and checks if it is allowed to be resolved. This value is set through the var command with _allowResolve. */
const _resolvable = str => {
	return (str.startsWith('scopedProxy.') || resolvableVars.indexOf(str) !== -1 || str.startsWith('window.')) ? true : false;
};
