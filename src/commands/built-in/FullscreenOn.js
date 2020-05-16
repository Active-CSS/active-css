_a.FullscreenOn = o => {
	let el = o.secSelObj;
	if (el.requestFullscreen) {
		el.requestFullscreen();
	} else if (el.mozRequestFullScreen) { /* Firefox */
		el.mozRequestFullScreen();
	} else if (el.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		el.webkitRequestFullscreen();
	} else if (el.msRequestFullscreen) { /* IE/Edge */
		el.msRequestFullscreen();
	}
};
