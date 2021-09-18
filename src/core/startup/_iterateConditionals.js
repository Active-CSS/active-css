const _iterateConditionals = (conditions, rules, sel) => {
	var counter, ruleName, ruleValue;
	Object.keys(rules).forEach(function(key) {
		ruleName = rules[key].name;
		// Check it has valid syntax.
		if (!ruleName) return;
		counter = conditions[sel].length;
		conditions[sel][counter] = {};
		if (!CONDCOMMAND.test(ruleName)) {
			_warn('Invalid conditional command name (see More info below)', null, ruleName);
			return;
		}
		if (typeof rules[key].value != 'string') {
			_warn('Invalid value for conditional ' + ruleName + ' (see More info below)', null, rules[key].value);
			return;
		}
		conditions[sel][counter].name = ruleName;
		conditions[sel][counter].value = rules[key].value;
		conditions[sel][counter].file = rules[key].file;
		conditions[sel][counter].line = rules[key].line;
		conditions[sel][counter].intID = rules[key].intID;
	});
	return conditions;
};
