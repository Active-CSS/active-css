const _checkPassiveState = (componentName, ev) => {
	if (doesPassive) {
		let componentRef = !componentName ? 'doc' : componentName;
		let realEv = ev;	// Need to check for the key event, as the config event will be named differently, but the main key event needs to be set as not passive.
		if (ev.substr(0, 3) == 'key') {	// Micro-optimise, as it all adds up.
			if (ev.substr(0, 5) == 'keyup') {
				realEv = 'keyup';
			} else if (ev.substr(0, 7) == 'keydown') {
				realEv = 'keydown';
			}
		}	// The fullscreen events shouldn't need any sort of treatment as they are at window level and you can't prevent default there.
		if (nonPassiveEvents[realEv] === undefined) {
			nonPassiveEvents[realEv] = true;
		}
	}
};