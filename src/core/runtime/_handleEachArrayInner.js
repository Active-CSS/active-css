const _handleEachArrayInner = (itemsObj, counter2) => {
	let newRef, eachLeftVar;

	eachLeftVar = itemsObj.leftVars[counter2].trim();
	newRef = itemsObj.rightVar + '[' + itemsObj.counter + ']' + '[' + counter2 + ']';
	itemsObj.existingLoopVars[eachLeftVar] = newRef;

	counter2++;
	if (itemsObj.leftVars[counter2]) {
		_handleEachArrayInner(itemsObj, counter2);
	}
};
