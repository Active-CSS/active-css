const _handleLoop = (loopObj) => {
	let {originalLoops, varScope} = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';
	let existingLoopVars = (loopObj.loopVars) ? loopObj.loopVars : [];

	// Which type of loop is it?
	// This is here for when we start adding different types of loops. For now we don't need the check.
	if (originalLoops.substr(0, 6) == '@each ') {
		// eg. @each name in person
		// eg. @each name, age in person
		// etc.
		// It limits variables to the scope we are in.
		let inPos = originalLoops.indexOf(' in ');
		let leftVar = originalLoops.substr(6, inPos - 6);
		let leftVars, eachLeftVar;
		if (leftVar.indexOf(',') !== -1) {
			// There is more than one left-hand assignment.
			leftVars = leftVar.split(',');
		}

		let rightVar = originalLoops.substr(inPos + 4);
		// Note that we don't use the real value of the list object in the *replacement* value - it evaluates in the scope dynamically, so we don't attach the scope.

		let rightVarVal, rightVarReal;
		if (existingLoopVars[rightVar] !== undefined) {
			let scoped = _getScopedVar(existingLoopVars[rightVar], varScope);
			rightVarReal = scoped.name;
			rightVarVal = scoped.val;
			// We need the real variable reference, so reassign rightVar.
			rightVar = existingLoopVars[rightVar];
		} else {
			let scoped = _getScopedVar(rightVar, varScope);
			rightVarReal = scoped.name;
			rightVarVal = scoped.val;
		}

		if (rightVarVal === undefined) {
			console.log('Active CSS error: ' + rightVarReal + ' is not defined - skipping loop.');
			return;
		}

		// The variables themselves get converted internally to the actual variable reference. By doing this, we can circumvent a whole bunch of complexity to do
		// with setting up new variables, and handling {{var}} variable binding, as internally we are referring to the real variable and not the config reference.
		// We do this by reading and replacing the remainder of this particular object with the correct values.
		// We keep the original object, and make copies for use in _performSecSel as we do the following looping.
		let newRef, loopObj2, i, j, key, val;
		if (isArray(rightVarVal)) {
			// Get the rightVar for real and loop over it.
			let rightVarValLen = rightVarVal.length;
			for (i = 0; i < rightVarVal.length; i++) {
				// Make a copy of loopObj. We're going to want original copies every time we substitute in what we want.
				loopObj2 = Object.assign({}, loopObj);
				if (!loopObj2.loopVars) loopObj2.loopVars = {};
				if (!leftVars) {
					// Single level array.
					newRef = rightVar + '[' + i + ']';
					existingLoopVars[leftVar] = newRef;
					loopObj2.loopRef = existingLoopRef + leftVar + '_' + i;
				} else {
					// Two dimensional array.
					for (j in leftVars) {
						eachLeftVar = leftVars[j].trim();
						newRef = rightVar + '[' + i + ']' + '[' + j + ']';
						existingLoopVars[eachLeftVar] = newRef;
					}
					loopObj2.loopRef = existingLoopRef + leftVars[0] + '_' + i;	// This will expand to include nested loop references and still needs work as this references multiple items.
				}
				loopObj2.loopVars = existingLoopVars;
				_performSecSel(loopObj2);
			}
		} else {
			let objValVar, co = 0;
			for ([key, val] of Object.entries(rightVarVal)) {
				loopObj2 = Object.assign({}, loopObj);
				if (!loopObj2.loopVars) loopObj2.loopVars = {};
				if (!leftVars) {
					// Only referencing the key in the key, value pair. We just place the key value straight in - there is no auto-var substitution for a key.
					// See _replaceLoopingVars for how this '-_-' works. It just places the value in, basically, and not a variable reference.
					existingLoopVars[leftVar] = '-_-' + key;
					loopObj2.loopRef = existingLoopRef + leftVar + '_0_' + co;
				} else {
					existingLoopVars[leftVars[0]] = '-_-' + key;
					loopObj2.loopRef = leftVars[0] + '_0_' + co;
					objValVar = leftVars[1].trim();
					newRef = rightVar + '.' + key;
					existingLoopVars[objValVar] = newRef;
					loopObj2.loopRef = existingLoopRef + objValVar + '_1_' + co;
				}
				co++;
				loopObj2.loopVars = existingLoopVars;
				_performSecSel(loopObj2);
			}				
		}
	}
};
