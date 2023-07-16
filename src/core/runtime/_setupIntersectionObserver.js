const _setupIntersectionObserver = () => {
	if (!initIntersectionObserver) {
		// Set up the intersection observer function. Only do this once.
		initIntersectionObserver = true;
		window._acssIntersectionObserver = new IntersectionObserver(function(entries, observer) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					ActiveCSS.trigger(entry.target, 'intersect');
					window._acssIntersectionObserver.unobserve(entry.target);
				}
			});
		});
	}
};
