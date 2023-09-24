const _setCSSProperty = o => {
	if (!_isConnected(o.secSelObj)) return;

	let prop = o.actVal;
	let importantPos = prop.indexOf('!important');
	let priority;
	if (importantPos !== -1) {
		priority = 'important';
		prop = prop.substring(0, importantPos);
	}
	o.secSelObj.style.setProperty(o.actName, prop, priority);
};
