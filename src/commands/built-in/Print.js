_a.Print = o => {
	if (o.actVal == 'window') {
		window.print();
	} else {
		let iframeSel = _getObj(o.actVal, o);
		// Check that it's an iframe.
		if (iframeSel) {
			if (iframeSel.tagName == 'IFRAME') {
				iframeSel.contentWindow.print();
			} else {
				_err('Printing cannot occur because element is not an iframe: ' + o.actVal);
			}
		} else {
			_err('Printing cannot occur if iframe does not exist: ' + o.actVal);
		}
	}
};
