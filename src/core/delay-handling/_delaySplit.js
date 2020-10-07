const _delaySplit = (str, typ, compRef) => {
	// Return an array containing an "after" or "every" timing, and any label (label not implemented yet).
	// Ignore entries in double quotes. Wipe out the after or every entries after handling.
	let regex, convTime, theLabel;
	regex = new RegExp('(' + typ + ' (stack|([\\{]?[\\@]?[\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w_\\-\\.\\:\\[\\]]+[\\}]?)(s|ms)))(?=(?:[^"]|"[^"]*")*)', 'gm');
	str = str.replace(regex, function(_, wot, wot2, delayValue, delayType) {
		if (delayValue && delayValue.indexOf('{') !== -1) {
			// Remove any curlies. The variable if there will be evaluated as it is, in _replaceJSExpression. Only one variable is supported.
			delayValue = delayValue.replace(/[\{\}]+/g, '');
			// Replace any scoped variables that may be in the timer value.
			convTime = _replaceJSExpression('{=' + delayValue + '=}', true, false, compRef) + delayType;
		} else {
			convTime = wot2;
		}
		convTime = _convertToMS(convTime, 'Invalid delay number format: ' + wot);
		return '';
	});
	// "after" and "every" share the same label. I can't think of a scenario where they would need to have their own label, but this functionality may need to be
	// added to later on. Maybe not.
	str = str.replace(/(label [\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)(?=(?:[^"]|"[^"]*")*)$/gm, function(_, wot) {
		// Label should be wot.
		theLabel = wot.split(' ')[1];
		return (typ == 'every') ? '' : wot;
	});
	return { str: str.trim(), tim: convTime, lab: theLabel };
};
