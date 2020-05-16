const _setupPassive = () => {
	// Does this browser support passive events?
	try {
		let opts = Object.defineProperty({}, 'passive', {
			get: function() {
			doesPassive = true;
		}});
		window.addEventListener('testPassive', null, opts);
		window.removeEventListener('testPassive', null, opts);
	} catch (e) {}
};
