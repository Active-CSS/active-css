_a.Fullscreen = o => {
	// https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
	let uiOpts = {};
	let aV = o.actVal, aVAfterOpts = '';
	if (_endsWithAny([ ' hide', ' show', ' auto' ], aV)) {
		let lastSpacePos = aV.lastIndexOf(' ');
		uiOpts.navigationUI = aV.substr(lastSpacePos + 1);
		aVAfterOpts = aV.substr(0, lastSpacePos).trim();
	} else {
		aVAfterOpts = aV;
	}

	let el;
	// Handle the window, document or body being called as a target. Either directly, or as a target selector with self, etc.
	if (aVAfterOpts == 'body' ||
			MEMAP.includes(aVAfterOpts) && origSecSel == 'body'
		) {
		el = document.documentElement;
	} else if (aVAfterOpts != 'close') {
		el = _getSel(o, aVAfterOpts);
	}
	switch (aVAfterOpts) {
		case 'close':
			if (document.fullscreenElement) {	// is in fullscreen mode.
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
			break;

		default:
			if (el.requestFullscreen) {
				el.requestFullscreen(uiOpts);
			} else if (el.mozRequestFullScreen) {
				el.mozRequestFullScreen(uiOpts);
			} else if (el.webkitRequestFullscreen) {
				el.webkitRequestFullscreen(uiOpts);
			} else if (el.msRequestFullscreen) {
				el.msRequestFullscreen(uiOpts);
			}
	}
};
