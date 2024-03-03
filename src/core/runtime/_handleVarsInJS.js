const _handleVarsInJS = function(str, varScope) {
	/**
	 * "str" is the full JavaScript content that is being prepared for evaluation.
	 * This function finds any "vars" line that declares any Active CSS variables that will be used, and locates and substitutes these variables into the code
	 * before evaluation. A bit like the PHP "global" command, except in this case we are not declaring global variables. We are limiting all variables to the
	 * scope of Active CSS. All the ease of global variables, but they are actually contained within Active CSS and not available outside Active CSS.
	 * 1. Names of variables get substituted with reference to the scopedProxy container variable for the scoped variables, which is private to the Active CSS IIFE.
	 *		This is literally just an insertion of "scopedProxy." and the appropriate scope before any matching variable name. The scope is worked out on the fly
	 *		at the moment the command (like "run"), or referenced command (like with "create-command") is run. So it works out the scopes dynamically every time. It
	 *		needs to run every time, as commands tend to be able to be used inside difference variable scopes, so each time there is potentially a different set of scoped
	 *		variables.
	 * 2. Variables enclosed in curlies get substituted with the value of the variable itself. This would be for rendered contents.
	 * Note: This could be optimised to be faster - there's bound to be some ES6 compatible regex magic that will do the job better than this.
	*/
	let mapObj = {}, mapObj2 = {};
	let found = false;
	str = str.replace(/[\s]*vars[\s]*([\u00BF-\u1FFF\u2C00-\uD7FF\w\, \$]+)[\s]*\;/gi, function(_, varList) {
		// We should have one or more variables in a comma delimited list. Split it up.
		let listArr = varList.split(','), thisVar, varObj;
		// Remove dupes from the list by using the Set command.
		listArr = [...new Set(listArr)];
		let negLookLetter = '(\\b)';		// Specifies same-type boundary to limit regex to that exact variable. For var starting with letter.
		let negLookDollar = '(\\B)';		// Specifies same-type boundary to limit regex to that exact variable. For var starting with $.
		found = true;
		for (thisVar of listArr) {
			thisVar = thisVar.trim();
			let negLookStart = thisVar.startsWith('$') ? negLookDollar : negLookLetter;
			let negLookEnd = thisVar.endsWith('$') ? negLookDollar : negLookLetter;
			let escapedVar = thisVar.replace(/\$/gm, '\\$');
			mapObj[negLookStart + '(' + escapedVar + ')' + negLookEnd] = '';
			// Variable can be evaluated at this point as the command runs dynamically. This is not the case with create-command which tends to run in places like
			// body:init and the actual command referenced needs to be dynamically.
			// So a different method is used there. But here for speed we can do it dynamically before the command is actually run.
			varObj = _getScopedVar(thisVar, varScope);
			mapObj2[thisVar] = varObj.fullName;
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
		str = ActiveCSS._mapRegexReturn(mapObj, str, mapObj2, true);	// true = case-sensitive.
		// Remove any substituted vars prefixes in quotes, as the user won't want to see those in their internal form.
		// Remove any /scopedProxy.*./ anywhere in single or double quotes catering for escaped quotes, this whole function could be optimised.
		str = str.replace(/(["|'][\s\S]*?["|'])/gim, function(_, innards) {
			return innards.replace(/scopedProxy\.[\u00BF-\u1FFF\u2C00-\uD7FF\w\$]+\./g, '');
		});
		str = str.replace(/cjs_tmp\-dq/g, '\\"');
		str = str.replace(/cjs_tmp\-sq/g, "\\'");
	}
	return str;
};
