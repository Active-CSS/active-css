const _getBaseURL = str => {
	let pos = str.indexOf('?');
	return (pos !== -1) ? str.substr(0, str.indexOf('?')) : str;
};
