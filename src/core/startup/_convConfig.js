// Credit goes to to https://github.com/aramk/CSSJSON for the initial regex parser technique that started this whole project off.
const _convConfig = (cssString, totOpenCurlies, co=0) => {
	// Note: By this point in initialisation the config should be compatible for parsing in a similar fashion to CSS.
	let node = { children: {}, attributes: {} }, match = null, count = 0, bits, sel, name, value, obj, newNode, commSplit;
	while ((match = PARSEREGEX.exec(cssString)) !== null) {
		if (co > totOpenCurlies) {
			// Infinite loop checker.
			// If the count goes above the total number of open curlies, we know we have a syntax error of an unclosed curly bracket.
			console.log('Syntax error in config - possibly an incomplete set of curly brackets.');
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
			newNode = _convConfig(cssString, totOpenCurlies, co);
			if (newNode === false) return false;	// There's been a syntax error.
			obj = {};
			obj.name = _sortOutEscapeChars(name);
			obj.value = newNode;
			obj.line = configLine;
			obj.file = configFile;
			obj.intID = intIDCounter++;
			obj.type = 'rule';
			node[count++] = obj;
		} else if (match[PARSEEND]) { return node;	// Found closing brace
		} else if (match[PARSEATTR]) {
			// Handle attributes.
			// Remove any comments lurking.
			var line = match[PARSEATTR].trim();
			line = line.replace(/\*debugfile[\s\S]*?\*|([^:]|^)\/\/.*$/g, '');
			var attr = PARSELINEX.exec(line);
			if (attr) {
				// Attribute
				name = attr[1].trim();
				value = attr[2].trim();
				obj = {};
				obj.name = _sortOutEscapeChars(name);
				obj.value = _sortOutEscapeChars(value);
				obj.type = 'attr';
				obj.line = configLine;
				obj.file = configFile;
				obj.intID = intIDCounter++;
				node[count++] = obj;
			} else {
				node[count++] = line;
			}
		}
	}
	return node;
};
