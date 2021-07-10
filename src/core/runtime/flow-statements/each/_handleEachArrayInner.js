const _handleEachArrayInner = (rightVarVal, itemsObj, counter2) => {
	let { loopObj, leftVars, scopePrefix, counter } = itemsObj;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo, 'inner')) return;

	let scopedVar = scopePrefix + leftVars[counter2].trim();
	_set(scopedProxy, scopedVar, rightVarVal[counter][counter2]);

	counter2++;
	if (itemsObj.leftVars[counter2]) {
		_handleEachArrayInner(rightVarVal, itemsObj, counter2);
	}
};
