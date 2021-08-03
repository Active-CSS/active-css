const _decrBreakContinue = (_imStCo, typ, decrement=false) => {
	// Break/Continue: returns false if nothing to break, true if there is a current thing to break out of.
	// Both handlings break out of the action command flow until it rehits the loop iteration.
	// The main difference is that for continue the loop continues if the continue number reaches zero, whereas for break it breaks out of the loop at zero.
	// This function sets up the handlings. The handlings themselves happen at various points in the event flow.
	// Variable clean-up occurs in _performEvent().
	let pointer = 'i' + _imStCo;
	let checkVar = (typ == 'break') ? _break[pointer] : _continue[pointer];
	if (!checkVar || checkVar == 0) return false;
	if (decrement) {
		if (typ == 'break') {
			_break[pointer]--;
		} else {
			// Only return true if we need to break out of this continue and go to the next outer loop;
			_continue[pointer]--;
			if (_continue[pointer] < 1) return false;
		}
	}
	return true;
};
