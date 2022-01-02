const _passesConditional = (condObj) => {
	let { el, sel, clause, evType, ajaxObj, doc, varScope, component, eve, compDoc } = condObj;
	// This takes up any conditional requirements set. Checks for "conditional" as the secondary selector.
	// Note: Scoped shadow conditionals look like "|(component name)|(conditional name)", as opposed to just (conditional name).

	let firstChar, chilsObj, key, obj, func, excl, i, checkExcl, exclLen, eType, eActual, exclArr, exclTargs, exclDoc, iframeID, aV;
	// Loop conditions attached for this check. Split conditions by spaces not in parentheses.

	clause = clause.replace(/(\(.*?\)|\{.*?\})/g, function(_) {
		return _.replace(/ /g, '_ACSSspace').replace(/,/g, '_ACSSEscComma');
	});

	let cond, conds = clause.split(/ (?![^\(\[]*[\]\)])/), rules, exclusions, nonIframeArr = [];

	let elC = (evType == 'clickoutside' && ajaxObj) ? ajaxObj : el;	// use click target if clickoutside.
	let actionBoolState = true;

	for (cond of conds) {
		cond = cond.replace(/_ACSSspace/g, ' ').replace(/__ACSSDBQuote/g, '"');

		let parenthesisPos = cond.indexOf('(');
		if (parenthesisPos === -1) {
			// Is this a built-in conditional? If so, check it has self as a default. If so, run it with self.
			// We can just check the CONDDEFSELF array to ascertain this.
			if (_condDefSelf(cond)) {
				// It can have defaults, set up parenthesisPos for later.
				parenthesisPos = cond.length;
				cond = cond + '(self)';
			}
		}
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
			if (_isCond(func)) {
				// Comma delimit for multiple checks in the same function.
				let aV = cond.slice(parenthesisPos + 1, -1).trim().replace(/"[^"]*"|(\,)/g, function(m, c) {
					// Split conditionals by comma.
				    if (!c) return m;
				    return '_ACSSComma';
				});
				let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
					{
						str: aV,
						func: 'Var',
						obj: el,
						secSelObj: el,
						varScope: varScope
					}
				);
				aV = _resolveVars(strObj.str, strObj.ref);
				if (!_checkCond({ commandName, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState })) {
					return false;
				}
			}
			continue;
		}
		if (component) {
			cond = '|' + component + '|' + cond;
			if (conditionals[cond] === undefined) {
				let condErr = cond.substr(component.length + 2);
				_err('Conditional ' + condErr + ' not found in config for component ' + component);
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
				if (_isCond(func)) {
					// Call the conditional function is as close a way as possible to regular functions.

					// Comma delimit for multiple checks on the same statement.
					let aV = obj.value.replace(/"[^"]*"|(\,)/g, function(m, c) {
						// Split conditionals by comma.
					    if (!c) return m;
					    return '_ACSSComma';
					});

					if (!_checkCond({ commandName: obj.name, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState })) {
						return false;
					}
				}
			}
		} else {
			// Check if this is a direct reference to a conditional command.
			_err('Conditional ' + cond + ' not found in config for document scope.');
		}
	}
	// Gotten through all the conditions - event actions are ok to run.
	return true;
};
