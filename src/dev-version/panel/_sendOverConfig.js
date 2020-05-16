ActiveCSS._sendOverConfig = () => {
	let str = JSON.stringify(Object.assign({}, config));
	return str;
};
