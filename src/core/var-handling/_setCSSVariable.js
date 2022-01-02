const _setCSSVariable = o => {
	if (o.origSecSel == ':root') {
		o.secSelObj.documentElement.style.setProperty(o.func, o.actVal);
	} else {
		o.secSelObj.style.setProperty(o.func, o.actVal);
	}
};
