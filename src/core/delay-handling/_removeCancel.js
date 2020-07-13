const _removeCancel = (delayRef, func, actPos, intID, loopRef) => {
	if (delayArr[delayRef] && delayArr[delayRef][func] && delayArr[delayRef][func][actPos] && delayArr[delayRef][func][actPos][intID]) {
		let tid = delayArr[delayRef][func][actPos][intID][loopRef];
		if (tid && labelByIDs[tid]) {
			let delData = labelByIDs[tid];
			labelByIDs.splice(labelByIDs.indexOf[tid]);
			delete labelData[delData.lab];
		}
		delayArr[delayRef][func][actPos][intID][loopRef] = null;
	}
	if (['~', '|'].includes(delayRef.substr(0, 1))) {
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][func] && cancelCustomArr[delayRef][func][actPos] && cancelCustomArr[delayRef][func][actPos][intID]) {
			cancelCustomArr[delayRef][func][actPos][intID][loopRef] = null;
		}
	} else {
		if (cancelIDArr[delayRef] && cancelIDArr[delayRef][func]) {
			cancelIDArr[delayRef][func] = null;
		}
	}
};
