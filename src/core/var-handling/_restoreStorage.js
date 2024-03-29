const _restoreStorage = () => {
	let sessionStore = window.sessionStorage.getItem('_acssSession');
	if (sessionStore !== undefined) {
		scopedOrig.session = JSON.parse(sessionStore);
		// Loop immediate items under session and set as session vars for the core to use.
		let key;
		for (key in scopedOrig.session) {
			sessionStoreVars[key] = true;
			_allowResolve('session.' + key);
		}		
	}
	let localStore = window.localStorage.getItem('_acssLocal');
	if (localStore !== undefined) {
		scopedOrig.local = JSON.parse(localStore);
		let key;
		for (key in scopedOrig.local) {
			localStoreVars[key] = true;
			_allowResolve('local.' + key);
		}		
	}
};
