const _iterateRules = (compConfig, rules, sel, ev, condition, componentName=null) => {
	let thisAct, ruleName, ruleValue, page, pageTitle, secsels, secselsLength, secsel, i, nam, val;
	let secSelCounter = -1;
	Object.keys(rules).forEach(function(key2) {
		nam = rules[key2].name;
		val = rules[key2].value;
		if (!nam) return;
		// Look for and handle any @each loop around potentially multiple secondary selectors.
		if (['@each'].indexOf(nam.substr(0, 5)) !== -1) {
			// Recurse and set up each loop.
			secSelCounter++;
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter][nam] = _iterateRules([], val, sel, ev, condition, componentName);
			return;
		}
		// Sort out actions addressed to the event selector, on the top-level with no secondary selector.
		if (typeof val === 'string') {
			// This is a top level action command directly under a primary selector. Assign it to the & secondary selector for use.
			// This must always go to a &, because the target needs to reflect the item evented on, not the primary selector, which may include multiple elements.
			// It needs to be able to refer to ONE element - the target which received the event.
			// Ie. the event is on a class, which is in more than one element, but only one of them was clicked on. We want THAT one, not the whole class
			// as the secondary selector. This is *really* important to remember, if anything in the code is optimised.
			secSelCounter++;
			if (nam == 'prevent-default') _checkPassiveState(componentName, ev);
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter]['&'] = [];
			compConfig[secSelCounter]['&'].push({ name: nam, value: val, file: rules[key2].file, line: rules[key2].line, intID: rules[key2].intID });
			return;
		}
		page = '';
		pageTitle = '';
		// Allow multiple secondary selectors. Split by comma. These will be arranged in the final config array in sequence.
		secsels = nam.split(',');
		secselsLength = secsels.length;
		for (i = 0; i < secselsLength; i++) {
			secsel = secsels[i].trim();
			// Is this a web component being declared? If so, set it up.
			secSelCounter++;
			compConfig[secSelCounter] = [];
			compConfig[secSelCounter][secsel] = [];
			for (thisAct in val) {
				if (val[thisAct].type === undefined) continue;
				if (secsel == '&' && val[thisAct].name == 'prevent-default') _checkPassiveState(componentName, ev);
				compConfig[secSelCounter][secsel].push({ name: val[thisAct].name, value: val[thisAct].value, file: val[thisAct].file, line: val[thisAct].line, intID: val[thisAct].intID });
			}
		}
	});

	return compConfig;
};
