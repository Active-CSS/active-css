const _checkMedia = mediaStr => {
	let mq = window.matchMedia(mediaStr);
	return mq.matches;
};
