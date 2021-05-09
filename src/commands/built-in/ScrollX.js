_a.ScrollX = o => {
	if (!_isConnected(o.secSelObj)) return false;
	if (o.secSel == 'body') {
		// All of these have been tested.
		if (o.actVal == 'left') {
			window.scrollTo({ left: 0 });
		} else if (o.actVal == 'right') {
			window.scrollTo({ left: 10000000 });	// As long as it's greater than the scroll bar it will go to the right, as standard.
		} else {
			window.scrollTo({ left: o.actVal });
		}
	} else {
		let el = o.secSelObj;
		if (o.actVal == 'left') {
			el.scrollLeft = 0;
		} else if (o.actVal == 'right') {
			el.scrollLeft = 10000000;	// As long as it's greater than the scroll bar it will go to the right, as standard. 10 million pixels should do it.
		} else {
			el.scrollLeft = o.actVal;
		}
	}
};
