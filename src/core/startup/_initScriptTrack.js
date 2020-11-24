const _initScriptTrack = () => {
	document.querySelectorAll('script').forEach(function (obj, index) {
		if (scriptTrack.indexOf(obj.src) === -1) scriptTrack.push(obj.src);
	});
};
