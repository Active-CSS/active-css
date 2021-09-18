const _handleCSSAtStatement = (loopObj, ifType) => {
	let { fullStatement, loopWhat, varScope, passTargSel, primSel, evType, obj, otherObj, eve, doc, component, compDoc } = loopObj;

	// @media works like an @if statement, so it can work with @else if and @else. Hence it is treated here like an @if statement after evaluation.

	// First, remove @media/@support clause.
	let statement = fullStatement;
	statement = statement.substr(ifType.length).trim();

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

	let res = (ifType.indexOf('media') !== -1) ? _checkMedia(statement) : _checkSupport(statement);
	if (res) {
		// This is ok - run the inner contents.
		_runSecSelOrAction(loopObj);
	}

	return { ifType: '@if', res };
};
