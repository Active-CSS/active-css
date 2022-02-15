const _replaceHTMLVars = (o, str, varReplacementRef=-1) => {
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\-\:]+)\}/gi, function(_, c) {
		let doc, noVars, escaped, unEscaped;
		let noVarsPos = c.indexOf(':NOVARS');
		if (noVarsPos !== -1) {
			noVars = true;
			c = c.replace(/\:NOVARS/, '');
		}
		let escapedPos = c.indexOf(':ESCAPED');
		if (escapedPos !== -1) {
			escaped = true;
			c = c.replace(/\:ESCAPED/, '');
		}
		let unEscapedPos = c.indexOf(':UNESCAPED');
		if (unEscapedPos !== -1) {
			unEscaped = true;
			c = c.replace(/\:UNESCAPED/, '');
		}
		if (o === undefined) {
			doc = document;
		} else if (c.startsWith('document:')) {
			c = c.substr(9);
			doc = document;
		} else {
			doc = _resolveDocObj(o.doc);
		}

		let el = doc.getElementById(c);
		if (el) {
			let res;
			switch (el.tagName) {
				case 'INPUT':
				case 'TEXTAREA':
					res = el.value;
					break;

				default:
					res = el.innerHTML;
			}
			if (noVars) res = _escNoVars(res);
			if (escaped) res = _safeTags(res);
			if (unEscaped) res = _unSafeTags(res);
			let newRes = _preReplaceVar(res, varReplacementRef);

			return newRes;
		}
		// Return it as it is if the element is not there.
		return '{#' + c + '}';
	});
	return str;
};
