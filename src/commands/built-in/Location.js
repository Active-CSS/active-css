_a.Location = o => {
	let page = o.actVal._ACSSRepQuo();
	if (o.doc.contentWindow) {
		o.doc.contentWindow.document.location.href = page;
	} else {
		document.location.href = page;
	}
};
