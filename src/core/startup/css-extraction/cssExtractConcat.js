const cssExtractConcat = cssObj => {
	let { file, statement, selector, commands } = cssObj;
	let tagRef = cssExtractGetRef(file);

	// If this tag existed but doesn't any more then it shouldn't be re-added - it's a tag that's been removed pending fully clean-up.
	if (extractedCSS[tagRef] === undefined) return;

	// Start working with the CSS object and add results to the current tag string placeholder. Make it pretty so it's readable in DevTools.
	// Handle any initial at-rule first. As far as I know, nested query-type at-rules are not allowed in CSS, so this works with that.
	// If that nested rule changes at some point, then all this will need to be updated.
	let cssString = '', mqlUsed;
	if (statement && statement.startsWith('__mql_') && conditionals[statement] !== undefined) {
		cssString += '@' + conditionals[statement][0].type + ' ' + conditionals[statement][0].query + ' {\n';
		mqlUsed = true;
	}
	let outerTabStr = mqlUsed ? '  ' : '';
	cssString += outerTabStr + selector + ' {\n';

	// Iterate commands object and compile string. We can only do this after initial parsing, which is a bit irritating but there may be a better way.
	let nestedCo = 0;	// monitors how many space tabs we need for indenting once we are inside the initial indent.
	const iter = commandsObj => {
		nestedCo++;
    	let res = '';
    	Object.keys(commandsObj).forEach(function (k) {
    		if (typeof commandsObj[k] === 'object') {
    			if (!commandsObj[k].value) {
    				console.log();
    				return;
    			}
	        	if (typeof commandsObj[k].value == 'object') {
		        	let isString;
					if (typeof commandsObj[k].name == 'string') {
						res += outerTabStr + '  '.repeat(nestedCo) + commandsObj[k].name + ' {\n';
						isString = true;
		            }
		            res += iter(commandsObj[k].value);
					if (isString) res += outerTabStr + '  '.repeat(nestedCo) + '}\n';
		            return;
	        	}
				res += outerTabStr + '  '.repeat(nestedCo) + commandsObj[k].name + ': ' + commandsObj[k].value + ';\n';
	        }
	    });
		nestedCo--;
	    return res;
	};
	cssString += iter(commands) + outerTabStr + '}\n';
	if (mqlUsed) {
		cssString += '}\n';
	}

	extractedCSS[tagRef] += cssString;
};
