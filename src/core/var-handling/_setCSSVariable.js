const _setCSSVariable = o => {
	if (o.secSel == ':root') {
		o.secSelObj.documentElement.style.setProperty(o.func, o.actVal);
	} else if (o.secSel == ':host') {
		o.secSelObj.host.style.setProperty(o.func, o.actVal);
	} else {
		o.secSelObj.style.setProperty(o.func, o.actVal);
	}
};
