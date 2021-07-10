const _handleIf = (loopObj, ifType) => {
	let { fullStatement, loopWhat, varScope, passTargSel, primSel, evType, obj, secSelObj, otherObj, eve, doc, component, compDoc, ifObj } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';
	let targetObj;

	// eg. @if display(#myDiv) && has-class(#myDiv .shadedGreen) || var({player} "X")
	// etc.

	// First, remove @if clause.
	let statement = fullStatement;
	statement = statement.substr(ifType.length).trim();

	// Do any variable substituting, etc. before parsing string to get ready for evaluation.
//	let prepExpr = _prepareDetachedExpr(statement, varScope);

	// Parse remainder into a format that can potentially be evaluated and bring back a true or false value.
	let parsedStatement;
	if (ifType == '@else') {
		// If it is even getting into here, the evaluation is set true and the rest is handled in the same way as @if and @else if.
		parsedStatement = 'true';
	} else {
		// The evaluation of "@if" and "@else if" is handled in the same way.
		parsedStatement = _replaceConditionalsExpr(statement);
	}
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
		};

		if (loopWhat != 'action' || typeof passTargSel == 'string') {
			// This is surrounding a target selector, so the reference object is the event receiver object.
			thisIfObj.obj = obj;
		} else if (typeof passTargSel == 'object') {
			thisIfObj.obj = passTargSel;
		}

		let res = _runIf(parsedStatement, fullStatement, thisIfObj);
		if (res) {
			// This is ok - run the inner contents.
			_runSecSelOrAction(loopObj);
		}

		return { ifType, res };
	}
	return false;
};
