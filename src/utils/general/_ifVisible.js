ActiveCSS._ifVisible = (o, tot) => {	// tot true is completely visible, false is partially visible. Used by extensions.
	let el = (typeof o.actVal === 'object') ? o.actVal : (o.actVal._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, o.actVal);	// Used by devtools highlighting.
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (tot) ? (elTop >= 0) && (elBot <= window.innerHeight) : elTop < window.innerHeight && elBot >= 0;
};
