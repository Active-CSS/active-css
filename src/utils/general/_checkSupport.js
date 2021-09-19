const _checkSupport = supportStr => {
	if (!SUPPORT_ED) _warn('CSS @support statement is not supported in this browser');
	let res = window.CSS.supports(supportStr);
	return res;
};
