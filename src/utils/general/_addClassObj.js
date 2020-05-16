ActiveCSS._addClassObj = (obj, str) => {
	if (!obj || !obj.classList) return; // element is no longer there.
	let arr = str.replace('.', '').split(' ');
	obj.classList.add(...arr);
};
