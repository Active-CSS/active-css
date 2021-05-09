_a.Style = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = _handleQuoAjax(o, o.actVal);
	let wot = str.split(' '), prop = wot.shift();
	o.secSelObj.style[prop] = wot.join(' ');
};
