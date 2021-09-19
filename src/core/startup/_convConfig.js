// Credit goes to to https://github.com/aramk/CSSJSON for the initial regex parser technique that started this whole project off.
const _convConfig = (cssString, totOpenCurlies, co, inlineActiveID) => {
	// Note: By this point in initialisation the config should be compatible for parsing in a similar fashion to CSS.
	let node = {}, match = null, count = 0, bits, sel, name, value, obj, newNode, commSplit;
	let topLevel = (!co);
	while ((match = PARSEREGEX.exec(cssString)) !== null) {
		if (co > totOpenCurlies) {
			// Infinite loop checker.
			// If the count goes above the total number of open curlies, we know we have a syntax error of an unclosed curly bracket.
			_err('Syntax error in config - possibly an incomplete set of curly brackets or a missing end semi-colon.');
			return false;
		}
		if (match[PARSEDEBUG]) {
			commSplit = match[PARSEDEBUG].split(':');
			configFile = commSplit[1];
			configLine = commSplit[2].substr(0, commSplit[2].length - 1);
		} else if (match[PARSESEL]) {
			co++;
			name = match[PARSESEL].trim();
			name = name.replace(/\*debugfile[\s\S]*?\*/g, '');
			newNode = _convConfig(cssString, totOpenCurlies, co, inlineActiveID);
			if (newNode === false) return false;	// There's been a syntax error.
			name = _sortOutEscapeChars(name);
			if (inlineActiveID) name = name.replace(/embedded\:loaded/g, '~_embedded_' + inlineActiveID + ':loaded');
			obj = {
				name,
				value: newNode,
				line: configLine,
				file: configFile,
				intID: intIDCounter++,
				type: 'rule'
			};
			// If this is the top-level, assign an incrementing master value than spans all config files. If not, use the inner loop counter.
			let counterToUse = (topLevel) ? masterConfigCo++ : count++;
			node[counterToUse] = obj;
		} else if (match[PARSEEND]) { return node;	// Found closing brace
		} else if (match[PARSEATTR]) {
			// Handle attributes.
			// Remove any comments lurking.
			var line = match[PARSEATTR].trim();
			line = line.replace(/\*debugfile[\s\S]*?\*|([^:]|^)\/\/.*$/g, '');
			var attr = PARSELINEX.exec(line);
			if (attr) {
				// Attribute
				obj = {
					name: _sortOutEscapeChars(attr[1].trim()),
					value: _sortOutEscapeChars(attr[2].trim()),
					type: 'attr',
					line: configLine,
					file: configFile,
					intID: intIDCounter++
				};
				node[count++] = obj;
			} else {
				node[count++] = line;
			}
		}
	}
	return node;
};
