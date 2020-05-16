const _addActValRaw = o => {
	// (AV is a reference to o.actVal)
	// Remove everything before the "?" in the file URL so we can store it for checking later.
	o.avRaw = o.actVal;
	if (o.avRaw.indexOf('?')) {
		// Remove any parameters to check if it is in configArr - store without the parameters, otherwise we get an accumulation of the same file in configArr.
		o.avRaw = _getBaseURL(o.avRaw);
	}
};
