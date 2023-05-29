const _handleWhileItem = (itemsObj, counterVal) => {
	let { loopObj, fullStatement, statement, scopePrefix } = itemsObj, loopObj2;
	let { _imStCo, evType, varScope, otherObj, sel: primSel, eve, doc, component, compDoc, loopWhat, passTargSel, _subEvCo, _subSubEvCo, _targCo } = loopObj;

	if (_checkBreakLoop(_imStCo)) {
		return;
	}

	loopObj2 = _clone(loopObj);

	loopObj2.loopRef = itemsObj.existingLoopRef + '_wh_' + counterVal;

	// Parse remainder into a format that can potentially be evaluated and bring back a true or false value.
	let parsedStatement = _replaceConditionalsExpr(statement);
	// Note: This hasn't been evaluated yet. This is just a check to see if the statement can be evaluated.

	if (parsedStatement !== false) {
		let thisIfObj = {
			evType,
			varScope,
			otherObj,
			sel: primSel,
			eve,
			doc,
			component,
			compDoc,
			_subEvCo,
			_subSubEvCo,
			_targCo
		};

		if (loopWhat != 'action' || typeof passTargSel == 'string') {
			// This is surrounding a target selector, so the reference object is the event receiver object.
			thisIfObj.obj = obj;
		} else if (typeof passTargSel == 'object') {
			thisIfObj.obj = passTargSel;
		}

		let res = _runIf(parsedStatement, fullStatement, thisIfObj, loopObj2);

		// Run the commands if passing and run this function again if we are still in the loop.
		if (res) {
			_runSecSelOrAction(loopObj2);
			loopObj2 = null;
			counterVal++;
			_handleWhileItem(itemsObj, counterVal);
		} else {
			_resetContinue(_imStCo);
		}
	}
};
