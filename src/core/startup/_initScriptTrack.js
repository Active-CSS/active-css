const _initScriptTrack = () => {
	document.querySelectorAll('script').forEach(function (obj, index) { scriptTrack.push(obj.src); });
};
