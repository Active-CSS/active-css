_a.Location = o => {
	let page = o.actVal._ACSSRepQuo();
	if (page == 'reload') {
		location.reload();
	} else if (o.doc.contentWindow) {
		o.doc.contentWindow.document.location.href = page;
	} else {
		document.location.href = page;
	}
};
