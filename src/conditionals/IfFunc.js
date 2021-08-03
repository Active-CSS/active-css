_c.IfFunc = o => {
	// Not a one-liner as we need the try/catch and error message.
	if (o.actVal == 'true') {
		return true;
	} else if (o.actVal == 'false') {
		return false;
	} else {
		try {
			return window[o.actVal](o);
		} catch(r) {
			_err('Function ' + o.actVal + ' does not exist', o);
		}
	}
};
