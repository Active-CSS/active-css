const _replaceConditionalsExpr = (str, varScope=null, o=null) => {
	// This function replaces ACSS conditionals dynamically (that have no "if-"), gets the return value as a string (ie. "true" or "false" and puts it
	// into the expression string for later evaluation.

	// Count parentheses. It's not possible to do matching parentheses with regex and account for all the possible combinations of the insides
	// that are not quoted. It needs to work with css selectors which are not quoted.
	// We could split by colon after escaping the colon preceding the pseudo-selectors and even embedded conditionals.
	// Like @if func(sadasd):func(sdfsdf .sdfsdf[escapedColon]not(sdfsdf)) {
	// That gives us an AND clause. But doesn't give us a way to have an OR, or a way to have complex () around AND and OR clauses.
	// Like @if (func(sadasd) && func(sdfsdf .sdfsdf[escapedColon]not(sdfsdf)) || func(sdfsdf)) && func(sdf) {
	// But it's easier just to split by (, then check for balanced parentheses once the function declaration has started.

	// First of all, as we're going to split by "(" and count ")", escape all "(" and ")" inside quotes and any single quotes that currently exist.
	let newStr = _escInQuo(str, '(', '__ACSSOpenP');
	newStr = _escInQuo(newStr, ')', '__ACSSClosP');
	newStr = _escInQuo(newStr, '\'', '__ACSSSingQ');
	// We're also going to escape any backslashes, so we avoid weirdness once we put commands in between quotes.
	newStr = _escInQuo(newStr, '\\', '__ACSSBSlash');

	// Error if the conditional has unbalanced parentheses.
	let countOp = newStr.split('(');
	if (countOp.length != newStr.split(')').length || countOp.length == 0) {
		_err('Opening/closing parentheses are unbalanced in @if statement, ' + str, o);
	}

	// Split by (function name)?\(. We need to do something to the function name to run it properly.
	// We do it like this so we don't have to get into parsing complex logic with AND and ORs.
	// We convert the ACSS syntax into using the actual conditional JavaScript functions instead and evaluate it as a whole after that.
	let arr = newStr.split(/([\![\s]*]?[\u00BF-\u1FFF\u2C00-\uD7FF\w\-]*\()/gim);

	/*
	Example for parsing and the resultant regex split:
		@if (var(cheese) && (has-class(sdfs(sdsdf .sdfsdf)) || var-true())) || var()
		""
		"("
		""
		"var("
		"cheese) && "
		"("
		""
		"has-class("
		""
		"sdfs("
		"sdsdf .sdfsdf)) || "
		"var-true("
		"))) || "
		"var("
		")"
	*/

	let funcJustStarted = false;
	let funcInProgress = false;
	let openInnerBrackets = 0;
	let outsideBrackets = 0;
	let erred = false;
	let condName = '';

	let newArr = arr.map(item => {
		if (item == '') return '';
		if (item == '(') {
			if (funcInProgress) {
				openInnerBrackets++;
			} else {
				outsideBrackets++;
			}
		} else if (!funcJustStarted && !funcInProgress) {
			// Possibly the start of a function in here. This is the only place a function name could be. It would have it's trailing "(".
			// The developer doesn't need to use the 'if' when writing in an if statement, but check it's existence out of courtesy so it isn't used twice.
			let start = 0;
			if (item.startsWith('!')) {
				start = 1;
			} else if (item.startsWith('not-')) {
				start = 4;
			}
			condName = item.slice(start, -1).trim();
			if (!condName.startsWith('if-')) condName = 'if-' + condName;

			// Test function. If it isn't present as stored conditional, built-in or custom, evaluate the original string.
			let func = condName._ACSSConvFunc();

			if (!_isCond(func)) return item;

			// Ok so far, start to reformat the conditional for JS parsing.
			funcJustStarted = true;
			if (start != 0) condName = '!' + condName;
			item = '_runAtIfConds(';

		} else {
			if (!funcInProgress) {
				funcInProgress = true;
				// Reached the start of the content of the function. Replace the function with data we need to call the conditional when evaluating.
				item = '\'' + condName + '\', ifObj, \'' + item;
			}

			// It could contain closing parentheses.
			// Count the number of closing parentheses.
			let numClosingBrackets = item.split(')').length - 1;
			let closingBracketCountDown = numClosingBrackets;
			if (numClosingBrackets > 0) {
				let bracketPos = item.indexOf(')');
				while (bracketPos !== -1 && openInnerBrackets > 0) {
					openInnerBrackets--;
					bracketPos = item.indexOf(')', bracketPos + 1);
					closingBracketCountDown--;
				}
				if (openInnerBrackets <= 0) {
					funcJustStarted = false;
					funcInProgress = false;
					item = item.substr(0, bracketPos) + '\'' + item.substr(bracketPos);
					// Adjust counters to account for any trailing closing parentheses.
					let bracketsLeft = numClosingBrackets - closingBracketCountDown;
					if (bracketsLeft > 0) {
						bracketPos = item.indexOf(')', bracketPos + 1);
						outsideBrackets--;
						while (bracketPos !== -1 && outsideBrackets > 0) {
							outsideBrackets--;
							bracketPos = item.indexOf(')', bracketPos + 1);
						}
					}
				}
			} else {
				openInnerBrackets++;
			}

		}
		return item;
	});

	// Don't run anything if there has been an error.
	if (erred) return false;

	// Rejoin the array to form the final string and unescape the inner parentheses ready for evaluation.
	let arrStr = newArr.join('');
	arrStr = arrStr.replace(/__ACSSOpenP/g, '(');
	arrStr = arrStr.replace(/__ACSSClosP/g, ')');
	// The backslashes and quotes get substituted back into place in the conditional function runner itself during evaluation.
	// Doing it this way is better for performance as it avoids having to get into complex string manipulation - there's no point.

	return arrStr;
};
