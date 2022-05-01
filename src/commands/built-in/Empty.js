_a.Empty = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let els = _getSels(o, o.actVal);
	if (els) {
		els.forEach(obj => {
			obj.innerHTML = '';
		});
	}
};
