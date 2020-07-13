ActiveCSS._addToConfig = (typ, ev, primSel, condList, eachLoop, secSel, act, val) => {	// Used by extensions.
	// Make sure we have this event set up.

	// This doesn't yet support adding components. _setupEvent will need a component flag for that to work probably.

	_setupEvent(ev, primSel);
	switch (typ) {
		case 'a':
			// Add the new rule. It will append to what is there if it exists already.
			val = _cleanUpRuleValue(val);
			let compConfig = config;
			let addArr = val.split(', ');
			let addArrLen = addArr.length, i, arr, ind, thisVal;
			for (i = 0; i < addArrLen; i++) {
				config = _assignRule(compConfig, primSel, ev, condList, secSel, act, addArr[i], '', '', '', eachLoop);
			}
	}
	_tellPanelToUpdate();
};
