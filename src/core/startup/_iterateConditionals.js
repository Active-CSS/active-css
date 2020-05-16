const _iterateConditionals = (conditions, rules, sel) => {
	var counter, ruleName, ruleValue;
	Object.keys(rules).forEach(function(key) {
		ruleName = rules[key].name;
		if (!ruleName) return;
		counter = conditions[sel].length;
		conditions[sel][counter] = {};
		conditions[sel][counter].name = ruleName;
		conditions[sel][counter].value = rules[key].value;
		conditions[sel][counter].file = rules[key].file;
		conditions[sel][counter].line = rules[key].line;
	});
	return conditions;
};
