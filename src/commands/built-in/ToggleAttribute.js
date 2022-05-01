_a.ToggleAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let arr = o.actVal.split(' ');
	let attr = arr[0];
	let force = arr[1] ? arr[1].trim() : null;
	if (force) force = (force === 'true') ? true : (force === 'false') ? false : null;
	if (force !== null) {
		o.secSelObj.toggleAttribute(attr, force);
	} else {
		o.secSelObj.toggleAttribute(attr);
	}
};
