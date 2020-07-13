const _unloadAllCancelTimer = () => {
	let i;
	// Each timeout needs individually deleting, hence the nested loopage. There should never be lots delayed events at any one time, and they do get cleaned up.
	for (i in delayArr) {
		_unloadAllCancelTimerLoop(i);
	}
	delayArr = [];
	cancelIDArr = [];
	labelData = [];
	labelByIDs = [];
};
