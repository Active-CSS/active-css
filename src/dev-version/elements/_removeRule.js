const _removeRule = (compConfig, sel, ev, condition, eachLoop, secsel, ruleName, ruleValue) => {
	// Note this rule value may be comma delimited itself, so we need to iterate through the values and remove each one.
	let rulePos;
	if (typeof compConfig[sel][ev][condition] === 'undefined') return compConfig;
	if (typeof compConfig[sel][ev][condition][eachLoop] === 'undefined') return compConfig;
	if (typeof compConfig[sel][ev][condition][eachLoop][secsel] === 'undefined') return compConfig;
	// See if this rule already exists here. It should do.
	rulePos = ActiveCSS._getPosOfRule(compConfig[sel][ev][condition][eachLoop][secsel], ruleName);
	if (rulePos != -1) {
		// Split and rejoin in case spaces are needed in the value we are checking.
		ruleValue = _cleanUpRuleValue(ruleValue);
		if (compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value == ruleValue) {
			// Delete the whole thing. Need to use splice.
			compConfig[sel][ev][condition][eachLoop][secsel].splice(rulePos, 1);
			// Clean up.
			if (compConfig[sel][ev][condition][eachLoop][secsel].length === 0) {
				_removeArrItem(config[sel][ev][condition][eachLoop], config[sel][ev][condition][eachLoop][secsel]);
			}
			if (compConfig[sel][ev][condition][eachLoop].length === 0) {
				delete config[sel][ev][condition][eachLoop];
			}
			if (Object.keys(compConfig[sel][ev][condition]).length === 0) {
				delete config[sel][ev][condition];
			}
			if (Object.keys(compConfig[sel][ev]).length === 0) {
				delete config[sel][ev];
			}
			if (Object.keys(compConfig[sel]).length === 0) {
				delete config[sel];
			}
		} else {
			let remArr = ruleValue.split(',');
			let remArrLen = remArr.length, i, arr, ind, thisVal;
			for (i = 0; i < remArrLen; i++) {
				thisVal = remArr[i].trim();
				// Delete only the part that contains the value we want to delete.
				arr = compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value.split(', ');
				ind = arr.indexOf(thisVal);
				if (index !== -1) {
					arr.splice(index, 1);
				}
				compConfig[sel][ev][condition][eachLoop][secsel][rulePos].value = arr.join(', ');
			}
		}
	}
	return compConfig;
};
