const _checkRunLoop = (outerTargetObj, chils, eachCommand, pointer, loopWhat) => {
	if (!chils) return;
	if (_getLoopCommand(eachCommand) !== false) {
		let outerTargetObjClone = _clone(outerTargetObj);
		let chilsClone = _clone(chils);
		let innerLoopObj = {
			...outerTargetObjClone,		// jshint ignore:line
		};
		let outerFill = [];
		outerFill.push(chilsClone);
		innerLoopObj.chilsObj = outerFill;
		innerLoopObj.currentLoop = eachCommand;
		innerLoopObj.loopWhat = loopWhat;
		if (loopWhat == 'action') {
			innerLoopObj.targPointer = pointer;
		} else {
			innerLoopObj.secSelLoops = '0';
			innerLoopObj._taEvCo = pointer;
		}
		_handleLoop(innerLoopObj);
		return true;
	}
};
