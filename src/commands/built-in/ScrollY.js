_a.ScrollY = o => {
	if (!_isConnected(o.secSelObj)) return false;
	if (o.origSecSel == 'body') {
		// All of these have been tested.
		if (o.actVal == 'top') {
			window.scrollTo({ top: 0 });
		} else if (o.actVal == 'bottom') {
			window.scrollTo({ top: 10000000 });		// As long as it's greater than the scroll bar it will go to the bottom, as standard.
		} else {
			window.scrollTo({ top: o.actVal });
		}
	} else {
		let el = o.secSelObj;
		if (el) {
			if (o.actVal == 'top') {
				el.scrollTop = 0;
			} else if (o.actVal == 'bottom') {
				el.scrollTop = el.scrollHeight;
			} else {
				el.scrollTop = o.actVal;
			}
		}
	}
};
