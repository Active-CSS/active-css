_a.Fullscreen = o => {
	// https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen

// This isn't ready yet - fix _parseConfig as it's breaking on the looping now as the keywords aren't being sorted out in the regex.


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
	if (['window', 'document', 'body'].includes(aVAfterOpts)) {
		el = document.documentElement;
	} else if (aVAfterOpts != 'close') {
		el = _getSel(o, aVAfterOpts);
	}
	switch (aVAfterOpts) {
		case 'exit':
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
			} else if (el.mozRequestFullScreen) { /* Firefox */
				el.mozRequestFullScreen(uiOpts);
			} else if (el.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				el.webkitRequestFullscreen(uiOpts);
			} else if (el.msRequestFullscreen) { /* IE/Edge */
				el.msRequestFullscreen(uiOpts);
			}
	}
};
