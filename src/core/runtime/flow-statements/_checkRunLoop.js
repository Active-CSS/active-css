const _checkRunLoop = (outerTargetObj, chils, statement, pointer, loopWhat) => {
	if (!chils || !statement.startsWith('@')) return { atIf: false };
	let atIfDetails = _getLoopCommand(statement);
	outerTargetObj._condCo++;

	if (atIfDetails !== false) {
		let outerTargetObjClone = _clone(outerTargetObj);
		let chilsClone = _clone(chils);
		let innerLoopObj = {
			...outerTargetObjClone,		// jshint ignore:line
		};
		let outerFill = [];
		outerFill.push(chilsClone);
		innerLoopObj.chilsObj = outerFill;
		innerLoopObj.fullStatement = statement;
		innerLoopObj.atIfDetails = atIfDetails;
		innerLoopObj.loopWhat = loopWhat;
		if (loopWhat == 'action') {
			innerLoopObj.targPointer = pointer;
		} else {
			innerLoopObj.secSelLoops = '0';
			innerLoopObj._taEvCo = pointer;
		}
		_handleLoop(innerLoopObj);
		if (innerLoopObj.ifRes && innerLoopObj.ifRes.res === true) outerTargetObj.previousIfRes = innerLoopObj.ifRes;
		return { atIf: true };
	} else {
		delete outerTargetObj.previousIfRes;
	}
	return { atIf: false };
};
