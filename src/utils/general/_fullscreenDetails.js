const _fullscreenDetails = () => {
	let arr;
	if ('MSGesture' in window) {
		/* Edge weirdness */
		arr = [document.webkitFullscreenElement, 'webkit'];
	} else {
		arr = [document.fullscreenElement, ''];
	}
	return arr;
};
