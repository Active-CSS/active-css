const _escNoVars = str => {
	return str.replace(/\{/gim, '__ACSSnoVarsOpCurly').replace(/\}/gim, '__ACSSnoVarsClCurly');
};
