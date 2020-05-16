const _handleVarsInJS = function(str) {
	/**
	 * "str" is the full JavaScript content that is being prepared for evaluation.
	 * This function finds any "vars" line that declares any Active CSS variables that will be used, and locates and substitutes these variables into the code
	 * before evaluation. A bit like the PHP "global" command, except in this case we are not declaring global variables. We are limiting all variables to the
	 * scope of Active CSS. All the ease of global variables, but they are actually contained within Active CSS and not available outside Active CSS. Global variables can still
	 * be used by using window['blah']. But private variables to Active CSS is, and should always be, the default.
	 * 1. Names of variables get substituted with reference to the scopedVars container variable for the scoped variables, which is private to the Active CSS IIFE.
	 *		This is literally just an insertion of "scopedVars." before any matching variable name.
	 * 2. Variables enclosed in curlies get substituted with the value of the variable itself. This would be for rendered contents.
	 * Note: This could be optimised to be faster - there's bound to be some ES6 compatible regex magic that will do the job better than this.
	*/
	let mapObj = {}, mapObj2 = {};
	let found = false;
	str = str.replace(/[\s]*vars[\s]*([\u00BF-\u1FFF\u2C00-\uD7FF\w_\, ]+)[\s]*\;/gi, function(_, varList) {
		// We should have one or more variables in a comma delimited list. Split it up.
		let listArr = varList.split(','), thisVar;
		// Remove dupes from the list by using the Set command.
		listArr = [...new Set(listArr)];
		let negLook = '(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)';
		found = true;
		for (thisVar of listArr) {
			thisVar = thisVar.trim();
			mapObj[negLook + '(' + thisVar + ')' + negLook] = '';
			mapObj2[thisVar] = 'scopedVars[_activeVarScope].' + thisVar;
		}
		return '';	// Return an empty line - the vars line was Active CSS syntax, not native JavaScript.
	});
	if (found) {
		// We don't want variables in quotes to show the internal variable name. And the solution needs to cater for escaped quotes.
		// At this point there is an array of regexes for all the variables we want to replace.
		// Bear in mind that there is a lot of regex stuff going on here.
		str = str.replace(/\\"/g, 'cjs_tmp-dq');
		str = str.replace(/\\'/g, 'cjs_tmp-sq');
		// By this point we should have a handy array of all the variables to be used in the native JavaScript.
		// We are going to used this as a regex map to substitute scoped prefixes into the code. But we use a non-regex replace object.
		str = ActiveCSS._mapRegexReturn(mapObj, str, mapObj2);
		// Remove any substituted vars prefixes in quotes, as the user won't want to see those in their internal form.
		// There's probably a faster way of doing this, but my regex brain isn't totally switched on today. Help if you can!
		// Just want to remove any /scopedVars\[_activeVarScope\]\./ anywhere in single or double quotes catering for escaped quotes.
		// If you can do that, lines 37, 38, 49 and 50 can go.
		str = str.replace(/(["|'][\s\S]*?["|'])/gim, function(_, innards) {
			return innards.replace(/scopedVars\[_activeVarScope\]\./g, '');
		});
		str = str.replace(/cjs_tmp\-dq"/g, '\\"');
		str = str.replace(/cjs_tmp\-sq/g, "\\'");
	}
	return str;
};
