ActiveCSS.triggerReal = (obj, ev, varScope, compDoc, component) => {
	if (typeof obj === 'string') {
		obj = document.querySelector(obj);
	}
	if (obj) {
		_a.TriggerReal({ secSelObj: obj, actVal: ev, varScope: varScope, compDoc: compDoc, component: component });
	} else {
		_err('No object found in document to triggerReal', o);
	}
};
