const _addACSSStyleTag = (acssTag) => {
	let activeID = _getActiveID(acssTag);
	inlineIDArr.push(activeID);
	concatConfigLen++;
	_addConfig(acssTag.innerHTML, { file: '_inline_' + activeID, inlineActiveID: activeID });
	return activeID;
};
