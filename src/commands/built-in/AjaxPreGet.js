_a.AjaxPreGet = o => {
	// Pre-load the url, and stores the results in an array so we don't have to run the ajax command later.
	o.preGet = true;
	_a.Ajax(o);
};
