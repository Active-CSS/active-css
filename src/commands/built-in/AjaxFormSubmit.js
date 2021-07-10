_a.AjaxFormSubmit = o => {
	o.formSubmit = true;
	const el = o.secSelObj;
	if (el) {
		o.url = el.action;
		_ajaxDo(o);
	} else {
		_err('Form not found', o);
	}
};
