const _handleWhile = loopObj => {
	let { fullStatement, _imStCo, loopWhat, varScope, passTargSel, primSel, evType, obj, secSelObj, otherObj, eve, doc, component, compDoc, _subEvCo, _subSubEvCo, _targCo } = loopObj;

	// eg. @while display(#myDiv) && has-class(#myDiv .shadedGreen) || var({player} "X")
	// etc.

	// First, remove @if clause.
	let statement = fullStatement;
	statement = statement.substr(7).trim();

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

		let loopRef = loopObj.loopRef || '';

		while (_runIf(parsedStatement, fullStatement, thisIfObj, loopObj)) {
			if (condTrack[_subEvCo] && condTrack[_subEvCo].condResArr[loopRef + loopObj._condCo + '_' + _subSubEvCo + '_' + _targCo]) {
				delete condTrack[_subEvCo].condResArr[loopObj.loopRef + loopObj._condCo + '_' + _subSubEvCo + '_' + _targCo];
			}

			// This is ok - run the inner contents.
			let loopObj2 = _clone(loopObj);
			_runSecSelOrAction(loopObj2);
			loopObj = loopObj2;
			// Clean up.
			loopObj2 = null;

			if (_checkBreakLoop(_imStCo)) {
				break;
			}
		}
	}
};
