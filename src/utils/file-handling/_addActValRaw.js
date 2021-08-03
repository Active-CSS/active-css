/**
 * Sets up the action flow object with an internal .avRaw property that contains the URL before the "?".
 *
 * Called by:
 *	_a.LoadConfig()
 *
 * Side-effects:
 *	Adjusts action flow object (adds an internally used .avRaw property)
 *
 * @private
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
const _addActValRaw = o => {
	// (AV is a reference to o.actVal)
	// Remove everything before the "?" in the file URL so we can store it for checking later.
	o.avRaw = o.actVal;
	if (o.avRaw.indexOf('?') !== -1) {
		// Remove any parameters to check if it is in configArr - store without the parameters, otherwise we get an accumulation of the same file in configArr.
		o.avRaw = _getBaseURL(o.avRaw);
	}
};
