const _escapeQuo = (str, func) => {
	return str.replace(/"/g, (func.startsWith('Render') ? '"' : '\\"'));
};
