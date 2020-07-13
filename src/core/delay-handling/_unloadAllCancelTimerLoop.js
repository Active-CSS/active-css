const _unloadAllCancelTimerLoop = i => {
	let j, k, l, m;
	for (j in delayArr[i]) {
		for (k in delayArr[i][j]) {
			for (l in delayArr[i][j][k]) {
				for (m in delayArr[i][j][k][l]) {
					_clearTimeouts(delayArr[i][j][k][l][m]);
				}
			}
		}
	}
};
