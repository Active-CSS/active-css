const _escNoVars = str => {
	return (typeof str === 'string') ? str.replace(/\{/gim, '__ACSSnoVarsOpCurly').replace(/\}/gim, '__ACSSnoVarsClCurly') : str;
};
