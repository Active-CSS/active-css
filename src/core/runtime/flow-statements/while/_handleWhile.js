const _handleWhile = loopObj => {
	let { fullStatement, _imStCo, loopWhat, varScope, passTargSel, primSel, evType, obj, secSelObj, otherObj, eve, doc, component, compDoc, _subEvCo, _subSubEvCo, _targCo } = loopObj;

	while (true) {
		// Done as a while to avoid getting into a memory leak.
		if (_checkBreakLoop(_imStCo)) break;

		// eg. @if display(#myDiv) && has-class(#myDiv .shadedGreen) || var({player} "X")
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
			let res = _runIf(parsedStatement, fullStatement, thisIfObj, loopObj);
			if (res) {
				// This is ok - run the inner contents.
				let loopObj2 = _clone(loopObj);
				_runSecSelOrAction(loopObj2);
				loopObj = loopObj2;
				// Clean up - this is proven to stop memory leak.
				loopObj2 = null;
			} else {
				break;
			}
		}
	}
};
