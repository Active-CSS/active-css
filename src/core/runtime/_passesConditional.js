const _passesConditional = (el, sel, condList, thisAction, otherEl, doc, varScope, component, eve, compDoc) => {
	// This takes up any conditional requirements set. Checks for "conditional" as the secondary selector.
	// Note: Scoped shadow conditionals look like "|(component name)|(conditional name)", as opposed to just (conditional name).

	let firstChar, chilsObj, key, obj, func, excl, i, checkExcl, exclLen, eType, eActual, exclArr, exclTargs, exclDoc, iframeID, res, aV;
	// Loop conditions attached for this check. Split conditions by spaces not in parentheses.

	condList = condList.replace(/(\(.*?\)|\{.*?\})/g, function(_) {
		return _.replace(/ /g, '_ACSSspace').replace(/,/g, '_ACSSEscComma');
	});

	let cond, conds = condList.split(/ (?![^\(\[]*[\]\)])/), rules, exclusions, nonIframeArr = [];

	let elC = (thisAction == 'clickoutside' && otherEl) ? otherEl : el;	// use click target if clickoutside.
	let actionBoolState = false;

	for (cond of conds) {
		cond = cond.replace(/_ACSSspace/g, ' ');

		let parenthesisPos = cond.indexOf('(');
		if (parenthesisPos !== -1) {
			// This is a direct reference to a command. See if it is there.
			let commandName = cond.substr(0, parenthesisPos);
			actionBoolState = false;
			if (commandName.substr(0, 4) == 'not-') {
				func = commandName.substr(4);
			} else if (commandName.substr(0, 1) == '!') {
				func = commandName.substr(1);
			} else {
				actionBoolState = true;
				func = commandName;
			}

			func = func._ACSSConvFunc();
			if (typeof _c[func] === 'function') {
				// Comma delimit for multiple checks in the same function.
				let aV = cond.slice(parenthesisPos + 1, -1).trim().replace(/"[^"]*"|(\,)/g, function(m, c) {
					// Split conditionals by comma.
				    if (!c) return m;
				    return '_ACSSComma';
				});

				if (!_checkCond({ actName: commandName, rules: cond, thisAction, aV, el, varScope, otherEl, func, sel, cond, eve, doc, component, compDoc, actionBoolState })) {
					return false;
				}
			}
			continue;
		}
		if (component) {
			cond = '|' + component + '|' + cond;
			if (conditionals[cond] === undefined) {
				let condErr = cond.substr(component.length + 2);
				console.log('Active CSS error: Conditional ' + condErr + ' not found in config for component ' + component);
			}
		}
		rules = conditionals[cond];
		if (rules) {
			// This is reference to a custom conditional and not a conditional command.
			for (key in rules) {
				if (!rules.hasOwnProperty(key)) continue;
				obj = rules[key];
				if (obj.name.substr(0, 1) == '!') {
					actionBoolState = false;
					func = obj.name.substr(1);
				} else {
					actionBoolState = true;
					func = obj.name;
				}
				func = func._ACSSConvFunc();
				if (typeof _c[func] === 'function') {
					// Call the conditional function is as close a way as possible to regular functions.

					// Comma delimit for multiple checks on the same statement.
					let aV = obj.value.replace(/"[^"]*"|(\,)/g, function(m, c) {
						// Split conditionals by comma.
					    if (!c) return m;
					    return '_ACSSComma';
					});

					if (!_checkCond({ actName: obj.name, rules, aV, el, varScope, otherEl, func, sel, cond, eve, doc, component, compDoc, actionBoolState })) {
						return false;
					}
				}
			}
		} else {
			// Check if this is a direct reference to a conditional command.
			console.log('Active CSS error: Conditional ' + cond + ' not found in config for document scope.');
		}
	}
	// Gotten through all the conditions - event actions are ok to run.
	return true;
};
