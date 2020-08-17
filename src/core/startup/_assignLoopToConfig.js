const _assignLoopToConfig = (configObj, nam, val, file, line, intID, componentName, ev) => {
	let secsels, secselsLength, secsel, i, thisAct, secSelCounter = -1;
	if (['@each'].indexOf(nam.substr(0, 5)) !== -1) {
		if (typeof configObj[secSelCounter] === 'undefined') {
			configObj[secSelCounter] = [nam.replace(/acss_int_loop_comm/g, ',')];
		}
		configObj[secSelCounter] = _assignLoopToConfig(configObj[secSelCounter], val.name, val.value, val.file, val.line, val.intID, componentName, ev);
		return configObj[secSelCounter];
	}
	secsels = nam.split(',');
	secselsLength = secsels.length;
	for (i = 0; i < secselsLength; i++) {
		secsel = secsels[i].trim();
		// Is this a web component being declared? If so, set it up.
		secSelCounter++;
		for (thisAct in val) {
			if (val[thisAct].name == 'prevent-default') _checkPassiveState(componentName, ev);
			if (typeof val[thisAct].type === 'undefined') continue;
			// Assign rule direct to the config. Nested if this is a loop.
			if (typeof configObj[secSelCounter] === 'undefined') {
				configObj[secSelCounter] = [];
			}
			if (typeof configObj[secSelCounter][secsel] === 'undefined') {
				// Note this next here needs to be an array and not an object, as we do splicing and adding later on from DevTools,
				// so we need to be flexible in the numbering.
				configObj[secSelCounter][secsel] = [];
			}
			// Add as a new rule.
			configObj[secSelCounter][secsel].push({ name: val[thisAct].name, value: val[thisAct].value, file: val[thisAct].file, line: val[thisAct].line, intID: val[thisAct].intID });

		}
	}
	return configObj;
};
