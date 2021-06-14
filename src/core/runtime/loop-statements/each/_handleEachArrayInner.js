const _handleEachArrayInner = (rightVarVal, itemsObj, counter2) => {
	let { leftVars, scopePrefix, counter } = itemsObj;

	let scopedVar = scopePrefix + leftVars[counter2].trim();
	_set(scopedProxy, scopedVar, rightVarVal[counter][counter2]);

	counter2++;
	if (itemsObj.leftVars[counter2]) {
		_handleEachArrayInner(rightVarVal, itemsObj, counter2);
	}
};
