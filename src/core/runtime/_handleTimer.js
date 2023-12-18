const _handleTimer = (typ, o, delayRef, runButElNotThere) => {
	let o2 = _clone(o), delLoop = ['after', 'every'], aftEv;
	let splitArr, tid, scope, commandProp, commandSing, origCommandSing;
	if (typ == 'func') {
		commandProp = 'actVal';
		commandSing = 'actValSing';
		origCommandSing = 'origActValSing';
	}
	for (aftEv of delLoop) {
		splitArr = _delaySplit(o2[commandProp], aftEv, o);
		scope = (o.evScope) ? o.evScope : 'main';
		if (splitArr.lab) splitArr.lab = scope + splitArr.lab;
		if (typeof splitArr.tim == 'number' && splitArr.tim >= 0) {
			o2[commandProp] = splitArr.str;
			o2[commandSing] = o2[commandProp];
			delayArr[delayRef] = (delayArr[delayRef] !== undefined) ? delayArr[delayRef] : [];
			delayArr[delayRef][o2.func] = (delayArr[delayRef][o2.func] !== undefined) ? delayArr[delayRef][o2.func] : [];
			delayArr[delayRef][o2.func][o2.actPos] = (delayArr[delayRef][o2.func][o2.actPos] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos] : [];
			delayArr[delayRef][o2.func][o2.actPos][o2.intID] = (delayArr[delayRef][o2.func][o2.actPos][o2.intID] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos][o2.intID] : [];
			if (delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]) {
//				console.log('Clear timeout before setting new one for ' + o2.func + ', ' + o2.actPos + ', ' + o2.intPos + ', ' + o2.loopRef);
				_clearTimeouts(delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]);
				_removeCancel(delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef);
			}
			o2.delayed = true;
			if (aftEv == 'after') {
				_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setTimeout(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
				if (typ == 'func') {
					_nextFunc(o);
		 		}
		 		return true;
			}
			o2.interval = true;
			o2[origCommandSing] = o2[commandSing];
			_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
			// Carry on down and perform the first action. The interval has been set.
			o.interval = true;
			o[commandSing] = splitArr.str;
		}
	}

	return false;
};
