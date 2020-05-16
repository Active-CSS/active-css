ActiveCSS._editConfig = (typ, oldEv, newEv, oldPrimSel, newPrimSel, oldCondList, newCondList, oldEachLoop='', newEachLoop='', oldSecSel='', newSecSel='', oldAct='', newAct='', oldVal='', newVal='') => {

	// Leave these commented out please. The parameters need converting to an object anyway, and this is handy for now.
//	console.log('typ: ' + typ);
//	console.log('oldEv: ' + oldEv);
//	console.log('newEv: ' + newEv);
//	console.log('oldPrimSel: ' + oldPrimSel);
//	console.log('newPrimSel: ' + newPrimSel);
//	console.log('oldCondList: ' + oldCondList);
//	console.log('newCondList: ' + newCondList);
//	console.log('oldEachLoop: ' + oldEachLoop);
//	console.log('newEachLoop: ' + newEachLoop);
//	console.log('oldSecSel: ' + oldSecSel);
//	console.log('newSecSel: ' + newSecSel);
//	console.log('oldAct: ' + oldAct);
//	console.log('newAct: ' + newAct);
//	console.log('oldVal: ' + oldVal);
//	console.log('newVal: ' + newVal);

	// These are deliberately not necessarily being set yet in the elements extensions if they do not have a value - this is in preparation for editable each loops.
	oldEachLoop = (!oldEachLoop) ? '0' : oldEachLoop;
	newEachLoop = (!newEachLoop) ? '0' : newEachLoop;

	// This doesn't yet support adding components. _setupEvent will need a component flag for that to work probably.

	_setupEvent(newEv, newPrimSel);
	oldVal = _cleanUpRuleValue(oldVal);
	newVal = _cleanUpRuleValue(newVal);
	switch (typ) {
		case 'p':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[oldPrimSel] || !config[oldPrimSel][oldEv] || !config[oldPrimSel][oldEv][oldCondList] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop]) {
				return;
			}
			// Copy the existing primSel's actions.
			let existingSecSels = config[oldPrimSel][oldEv][oldCondList][oldEachLoop];
			// Delete the existing primSel.
			delete config[oldPrimSel][oldEv][oldCondList][oldEachLoop];
			// Clean up.
			if (Object.keys(config[oldPrimSel][oldEv][oldCondList]).length === 0) {
				delete config[oldPrimSel][oldEv][oldCondList];
			}
			if (Object.keys(config[oldPrimSel][oldEv]).length === 0) {
				delete config[oldPrimSel][oldEv];
			}
			if (Object.keys(config[oldPrimSel]).length === 0) {
				delete config[oldPrimSel];
			}
			// Now work out where to put the new Config.
			// Just loop through the existing actions for this primSel and add them.
			let secSel, secSelLen, i;
			for (secSel in existingSecSels) {
				secSelLen = existingSecSels[secSel].length;
				for (i = 0; i < secSelLen; i++) {
					newAct = existingSecSels[secSel][i].name;
					newVal = existingSecSels[secSel][i].value;
					ActiveCSS._addToConfig('a', newEv, newPrimSel, newCondList, newEachLoop, secSel, newAct, newVal);
				}
			}
			break;

		case 's':
			// It is possible this isn't set up yet. It won't be until there are some actions. Skip it until there are.
			if (!config[oldPrimSel] || !config[oldPrimSel][oldEv] || !config[oldPrimSel][oldEv][oldCondList] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel] || !config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel]) {
				return;
			}
			// Copy the existing secSel's actions.
			let tmpSecSelObj = config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel];
			// Delete the existing secSel.
			delete config[oldPrimSel][oldEv][oldCondList][oldEachLoop][oldSecSel];
			// Add the new secSel.
			config[oldPrimSel][oldEv][oldCondList][oldEachLoop][newSecSel] = tmpSecSelObj;
			break;

		case 'a':
			// This is either an action name or an action value change. We do the same edit handling for either one, as the existing add and remove
			// functions should cover all scenarios.
			// Find and remove the old action name and old action value from the config.
			ActiveCSS._removeFromConfig('a', newEv, newPrimSel, newCondList, newEachLoop, newSecSel, oldAct, oldVal);
			// Add the new action name and new action value.
			ActiveCSS._addToConfig('a', newEv, newPrimSel, newCondList, newEachLoop, newSecSel, newAct, newVal);
	}
	_tellPanelToUpdate();
};
