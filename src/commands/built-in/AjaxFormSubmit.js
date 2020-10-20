_a.AjaxFormSubmit = o => {
	o.formSubmit = true;
	const el = o.secSelObj;
	if (el) {
		o.url = el.action;
		_ajaxDo(o);
	} else {
		console.log('Active CSS error: Form not found.', o.secSelObj);
	}
};
