const _handleTimer = (commandType, o, delayRef, runButElNotThere) => {
	let o2 = _clone(o), delLoop = ['after', 'every'], aftEv;
	let splitArr, tid, scope, commandProp, commandSing, origCommandSing, commandPos;
	if (commandType == 'func') {
		// This is an action command delay.
		commandProp = 'actVal';
		commandSing = 'actValSing';
		origCommandSing = 'origActValSing';
		commandPos = 'actPos';
	} else {
		// This is a target selector delay.
		commandProp = 'target';
		commandSing = 'targetSing';
		origCommandSing = 'origTargetSing';
		commandPos = 'targetPos';
	}
	for (aftEv of delLoop) {
		splitArr = _delaySplit(o2[commandProp], aftEv, o);
		scope = (o.evScope) ? o.evScope : 'main';
		if (splitArr.lab) splitArr.lab = scope + splitArr.lab;
		if (typeof splitArr.tim == 'number' && splitArr.tim >= 0) {
			if (aftEv == 'every' && splitArr.tim == 0) _err('Cannot have a zero time value with "every".', o);

			o2[commandProp] = splitArr.str;
			o2[commandSing] = o2[commandProp];
			delayArr[delayRef] = (delayArr[delayRef] !== undefined) ? delayArr[delayRef] : [];
			delayArr[delayRef][o2[commandType]] = (delayArr[delayRef][o2[commandType]] !== undefined) ? delayArr[delayRef][o2[commandType]] : [];
			delayArr[delayRef][o2[commandType]][o2[commandPos]] = (delayArr[delayRef][o2[commandType]][o2[commandPos]] !== undefined) ? delayArr[delayRef][o2[commandType]][o2[commandPos]] : [];
			delayArr[delayRef][o2[commandType]][o2[commandPos]][o2.intID] = (delayArr[delayRef][o2[commandType]][o2[commandPos]][o2.intID] !== undefined) ? delayArr[delayRef][o2[commandType]][o2[commandPos]][o2.intID] : [];
			if (delayArr[delayRef][o2[commandType]][o2[commandPos]][o2.intID][o2.loopRef]) {
//				console.log('Clear timeout before setting new one for ' + o2[commandType] + ', ' + o2[commandPos] + ', ' + o2.intPos + ', ' + o2.loopRef);
				_clearTimeouts(delayArr[delayRef][o2[commandType]][o2[commandPos]][o2.intID][o2.loopRef]);
				_removeCancel(delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef);
			}
			o2.delayed = true;
			if (aftEv == 'after') {
				if (commandType == 'func') {
					_setupLabelData(splitArr.lab, delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef, o._subEvCo,
						setTimeout(		// jshint ignore:line
							// Remove the delay vars at the same time. The return value is not used in _handleFunc.
							_handleFunc.bind(this, o2, delayRef, runButElNotThere, _removeCancel(delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef)), splitArr.tim)
					);
					_nextFunc(o);
		 		} else {
					// Use the target selector without any delays as the secSelObj to resume from in _performTargetOuter.
					// Only remove the after label - don't remove if every is here, as that should keep the label
					let timerObj = { _subEvCo: o2._subEvCo, intID: o2.intID, secSelObj: splitArr.str, loopRef: o2.loopRef, origLoopObj: o2.origLoopObj };
					_setupLabelData(splitArr.lab, delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef, o._subEvCo,
						setTimeout(() => {	// jshint ignore:line
							_removeCancel(delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef);
							let setAfterEvery = (splitArr.str.indexOf(' every ') !== -1) ? true : false;
							_setResumeObj(timerObj, setAfterEvery);
							_syncRestart(timerObj, timerObj._subEvCo);
						}, splitArr.tim)
					);
		 		}
		 		return true;
			}
			o2.interval = true;
			o2[origCommandSing] = o2[commandSing];
			if (commandType == 'func') {
				_setupLabelData(splitArr.lab, delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef, o._subEvCo, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
			} else {
				let timerObj = { _subEvCo: o2._subEvCo, intID: o2.intID, secSelObj: splitArr.str, loopRef: o2.loopRef, origLoopObj: o2.origLoopObj };
				_setupLabelData(splitArr.lab, delayRef, o2[commandType], o2[commandPos], o2.intID, o2.loopRef, o._subEvCo,
					setInterval(() => {	// jshint ignore:line
						_setResumeObj(timerObj);
						_syncRestart(timerObj, timerObj._subEvCo);
					}, splitArr.tim)
				);
			}
			// Carry on down and perform the first action. The interval has been set.
			o.interval = true;
			o[commandSing] = splitArr.str;
			if (commandType != 'func') {
				// Target selector "every".
				return o;
			}
		}
	}

	return false;
};
