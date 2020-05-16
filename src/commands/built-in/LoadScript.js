_a.LoadScript = (o, opt) => {
	let scr = o.actVal._ACSSRepQuo();
	let trimmedURL = _getBaseURL(scr);
	if (!scriptTrack.includes(trimmedURL)) {
		let typ = (opt == 'style') ? 'link' : 'script';
		let srcTag = (opt == 'style') ? 'href' : 'src';
		let scrip = o.doc.createElement(typ);
		if (opt == 'style') {
			scrip.rel = 'stylesheet';
		}
		scrip[srcTag] = scr;
		o.doc.head.appendChild(scrip);
		scriptTrack.push(trimmedURL);
	}
};
