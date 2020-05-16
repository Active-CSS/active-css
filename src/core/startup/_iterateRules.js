const _iterateRules = (compConfig, rules, sel, ev, condition, eachLoop=null, componentName=null) => {
	let thisAct, ruleName, ruleValue, page, pageTitle, secsels, secselsLength, secsel, i, nam, val;
	Object.keys(rules).forEach(function(key2) {
		nam = rules[key2].name;
		val = rules[key2].value;
		if (!nam) return;
		// Look for and handle any @each loop around potentially multiple secondary selectors.
		if (['@each'].indexOf(rules[key2].name.substr(0, 5)) !== -1) {
			// Recurse and set up each loop.
			// Note: Nested loops are not supported as of version 2.0. The '|||' doesn't do much at all at the moment, although it allows each to run in components.
			return _iterateRules(compConfig, val, sel, ev, condition, ((eachLoop) ? eachLoop + '|||' : '') + nam);
		}
		// Sort out actions addressed to the event selector, on the top-level with no secondary selector.
		if (typeof val === 'string') {
			// This is a top level action command directly under a primary selector. Assign it to the & secondary selector for use.
			// This must always go to a &, because the target needs to reflect the item evented on, not the primary selector, which may include multiple elements.
			// It needs to be able to refer to ONE element - the target which received the event.
			// Ie. the event is on a class, which is in more than one element, but only one of them was clicked on. We want THAT one, not the whole class
			// as the secondary selector. This is *really* important to remember, if anything in the code is optimised.
			if (nam == 'prevent-default') _checkPassiveState(componentName, ev);
			compConfig = _assignRule(compConfig, sel, ev, condition, '&', nam, val, rules[key2].file, rules[key2].line, eachLoop);
			return;
		}
		page = '';
		pageTitle = '';
		for (thisAct in val) {
			if (typeof val[thisAct].type === 'undefined') continue;
			// Allow multiple secondary selectors. Split by comma.
			secsels = nam.split(',');
			secselsLength = secsels.length;
			for (i = 0; i < secselsLength; i++) {
				secsel = secsels[i].trim();
				// Is this a web component being declared? If so, set it up.
//				if (secsel.indexOf('-') !== -1) {
//					// This could be a web component declaration. Set it up if it is. We just do a quick indexOf check for performance reasons on startup.
//					secsel = _setUpWebComponent(secsel);
//				}
				if (secsel == '&' && nam == 'prevent-default') _checkPassiveState(componentName, ev);
				compConfig = _assignRule(compConfig, sel, ev, condition, secsel, val[thisAct].name, val[thisAct].value, rules[key2].file, rules[key2].line, eachLoop);
			}
		}
	});

	return compConfig;
};
