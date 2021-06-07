const _removeCancel = (delayRef, func, actPos, intID, loopRef) => {
	if (delayArr[delayRef] && delayArr[delayRef][func] && delayArr[delayRef][func][actPos] && delayArr[delayRef][func][actPos][intID]) {
		let tid = delayArr[delayRef][func][actPos][intID][loopRef];
		if (tid && labelByIDs[tid]) {
			let delData = labelByIDs[tid];
			labelByIDs.splice(labelByIDs.indexOf[tid]);
			delete labelData[delData.lab];
		}
		delete delayArr[delayRef][func][actPos][intID][loopRef];
		delete delaySync[tid];
	}
	if (['~', '|'].includes(delayRef.substr(0, 1))) {
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][func] && cancelCustomArr[delayRef][func][actPos] && cancelCustomArr[delayRef][func][actPos][intID]) {
			delete cancelCustomArr[delayRef][func][actPos][intID][loopRef];
		}
	} else {
		if (cancelIDArr[delayRef] && cancelIDArr[delayRef][func]) {
			delete cancelIDArr[delayRef][func];
		}
	}
};
