const _outDebug = (showErrs, errs) => {
	if (showErrs) {
		let err;
		for (err of errs) {
			console.log(err);
		}
	}
};
