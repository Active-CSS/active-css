ActiveCSS.triggerReal = (obj, ev, shadowRef, shadowDoc, component) => {
	if (typeof obj === 'string') {
		obj = document.querySelector(obj);
	}
	if (obj) {
		_a.TriggerReal({ secSelObj: obj, actVal: ev, shadowRef: shadowRef, shadowDoc: shadowDoc, component: component });
	} else {
		console.log('No object found in document to triggerReal.');
	}
};
