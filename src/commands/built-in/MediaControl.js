_a.MediaControl = o => {
	// Works with audio or video.
	if (!_isConnected(o.secSelObj)) return false;
	let secSelObj = o.secSelObj;	// This minifies better.
	let arr = o.actVal.split(' ');
	if (arr[1]) {
		arr[1] = arr[1]._ACSSRepQuo();
		switch (arr[0]) {
			case 'load':
				secSelObj.setAttribute('src', arr[1]);
				break;

			case 'seek':
				secSelObj.currentTime = parseFloat(arr[1]);
				break;

			case 'volume':
				secSelObj.volume = parseFloat(arr[1]);	// Value between 0 and 1.
				break;

		}
	}
	switch (arr[0]) {
		case 'play':
			secSelObj.play();
			break;

		case 'pause':
			secSelObj.pause();
			break;

		case 'load':
			secSelObj.load();
			break;
	}
};
