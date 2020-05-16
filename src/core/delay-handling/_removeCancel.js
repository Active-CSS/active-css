const _removeCancel = (delayRef, func, actPos, loopRef) => {
	if (delayArr[delayRef] && delayArr[delayRef][func] && delayArr[delayRef][func][actPos]) {
		let tid = delayArr[delayRef][func][actPos][loopRef];
		if (tid && labelByIDs[tid]) {
			let delData = labelByIDs[tid];
			labelByIDs.splice(labelByIDs.indexOf[tid]);
			delete labelData[delData.lab];
		}
		delayArr[delayRef][func][actPos][loopRef] = null;
	}
	if (['~', '|'].includes(delayRef.substr(0, 1))) {
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][func] && cancelCustomArr[delayRef][func][actPos]) {
			cancelCustomArr[delayRef][func][actPos][loopRef] = null;
		}
	} else {
		if (cancelIDArr[delayRef] && cancelIDArr[delayRef][func]) {
			cancelIDArr[delayRef][func] = null;
		}
	}
};
