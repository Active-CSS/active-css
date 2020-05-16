const _mimicReset = e => {
	var key, obj, prop;
	for (key in e.target.cjsReset) {
		if (key == 'title') continue;
		obj = e.target.cjsReset[key];
		switch (obj.type) {
			case 'text':
				obj.el.innerText = obj.value;
				break;
			default:
				obj.el.value = obj.value;
				break;
		}
	}
	if (e.target.cjsReset.title) {
		currDocTitle = ActiveCSS._decodeHTML(e.target.cjsReset.title);
		document.title = currDocTitle;
	}
};
