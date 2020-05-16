const _replaceLoopingVars = (str, loopVars) => {
	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-]+)(\}|\.|\[)/gm, function(_, wot, endBit) {
			if (loopVars[wot]) {
				if (loopVars[wot].substr(0, 3) == '-_-') {
					// This is a key of an object. Just return the value itself. No auto-change option for object keys, only values.
					return loopVars[wot].substr(3);
				} else {
					// This matches a variable reference. Substitute with the real variable location reference.
					return '{' + loopVars[wot] + endBit;
				}
			} else {
				// This variable is not in the substitution list.
				return '{' + wot + endBit;
			}
		});
	}
	return str;
};
