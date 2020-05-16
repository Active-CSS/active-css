const _unloadAllCancelTimer = () => {
	let i, j, k, l;
	// Each timeout needs individually deleting, hence the nested loopage. There should never be lots delayed events at any one time, and they do get cleaned up.
	for (i in delayArr) {
		for (j in delayArr[i]) {
			for (k in delayArr[i][j]) {
				for (l in delayArr[i][j][k]) {
					_clearTimeouts(delayArr[i][j][k][l]);
					delayArr[i][j][k][l] = null;
				}
			}
		}
	}
	delayArr = [];
	cancelIDArr = [];
	labelData = [];
	labelByIDs = [];
};
