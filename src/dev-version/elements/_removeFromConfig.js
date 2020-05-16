ActiveCSS._removeFromConfig = (typ, ev, primSel, condList, eachLoop, secSel, act, val) => {
	let rulePos;
	switch (typ) {
		case 'p':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[primSel] || !config[primSel][ev] || !config[primSel][ev][condList]) {
				return;
			}
			// Delete the primSel.
			delete config[primSel][ev][condList];
			// Clean up.
			if (Object.keys(config[primSel][ev]).length === 0) {
				delete config[primSel][ev];
			}
			if (Object.keys(config[primSel]).length === 0) {
				delete config[primSel];
			}
			break;

		case 's':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[primSel] || !config[primSel][ev] || !config[primSel][ev][condList] || !config[primSel][ev][condList][eachLoop] || !config[primSel][ev][condList][eachLoop][secSel]) {
				return;
			}
			// Delete the secsel.
			_removeArrItem(config[primSel][ev][condList][eachLoop], config[primSel][ev][condList][eachLoop][secSel]);
			// Clean up.
			if (config[primSel][ev][condList][eachLoop].length === 0) {
				_removeArrItem(config[primSel][ev][condList], config[primSel][ev][condList][eachLoop]);
			}
			if (Object.keys(config[primSel][ev][condList]).length === 0) {
				delete config[primSel][ev][condList];
			}
			if (Object.keys(config[primSel][ev]).length === 0) {
				delete config[primSel][ev];
			}
			if (Object.keys(config[primSel]).length === 0) {
				delete config[primSel];
			}
			break;

		case 'a':
			// Find the rule and delete it. It should remove a comma-delimited item if necessary and not the whole thing.
			let compConfig = config;
			config = _removeRule(compConfig, primSel, ev, condList, eachLoop, secSel, act, val);
	}
	// Send message to Panel if it is active.
	_tellPanelToUpdate();
};
