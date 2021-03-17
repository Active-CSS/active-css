const _setUpNavAttrs = (el) => {
	let hrf, templ, shortAttr, navEl;
	templ = document.getElementById('data-active-pages');
	if (templ) {
		shortAttr = el.getAttribute('href');
		if (shortAttr) {
			navEl = templ.querySelector('a[href="' + shortAttr + '"]');
			if (navEl) {
				_cloneAttrs(el, navEl);
			}
		}
	}
};
