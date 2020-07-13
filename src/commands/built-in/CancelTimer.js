_a.CancelTimer = o => {
	// Delay action on a secSel by action or label.
	// This is scoped by document or specific shadow DOM or component.
	let val = o.actVal.trim();
	let func = val._ACSSConvFunc();
	let found = true;
	let i, pos, intID, delayRef, loopref;
	let scope = (o.compRef) ? o.compRef : 'main';
	// It could be a label cancel. If the label exists, remove the delay.
	if (labelData[scope + val]) {
		// This is a label cancel. We know it is tied to a specific action value.
		// Format:
		// labelData[splitArr.lab] => { del: delayRef, func: o2.func, pos: o2.pos, o2.intID, tid: tid };
		// labelByIDs[tid] => { del: delayRef, func: o2.func, pos: o2.pos, o2.intID, lab: splitArr.lab };
		let delData = labelData[scope + val];
		_clearTimeouts(delayArr[delData.del][delData.func][delData.pos][delData.intID][delData.loopRef]);
		_removeCancel(delData.del, delData.func, delData.pos, delData.intID, delData.loopRef);
	} else {
		delayRef = (!['~', '|'].includes(o.secSel.substr(0, 1))) ? _getActiveID(o.secSelObj) : o.secSel;
		if (!delayRef) return;
		if (delayArr[delayRef]) {
			if (val == 'all') {
				for (i in delayArr[delayRef]) {
					// Clear all timeout attributes for this selector, and the timeout itself.
					for (pos in delayArr[delayRef][i]) {
						for (intID in delayArr[delayRef][i][pos]) {
							for (loopref in delayArr[delayRef][i][pos][intID]) {
								_clearTimeouts(delayArr[delayRef][i][pos][intID][loopref]);
								_removeCancel(delayRef, i, pos, intID, loopref);
							}
						}
					}
				}
			} else {
				if (delayArr[delayRef] && delayArr[delayRef][func]) {
					// Clear all actions set up for this function.
					for (pos in delayArr[delayRef][func]) {
						for (intID in delayArr[delayRef][func][pos]) {
							for (loopref in delayArr[delayRef][func][pos][intID]) {
								_clearTimeouts(delayArr[delayRef][func][pos][intID][loopref]);
								_removeCancel(delayRef, func, pos, intID, loopref);
							}
						}
					}
				} else {
					found = false;
				}
			}
		} else {
			found = false;
		}
		if (!found) {
			// If it's not covered by the above selector, then it may be covered by some other cancel not directly tied to the Active ID.
			// Mark it for ignoring when the actual timeout hits.
			// Is there something about to hit this object? We need to check this, otherwise we are going to have an object that has a cancel-timer attached
			// but it may not need one. We could have marked the item as the point of delay, but there can be multiples of action values. We've got an a delay
			// event with the func, we just need to check all the o.secSels, which we can do. There are not going to be too many active cancel-delays in effect.
			// We use the data-activeid found from the results and compare with the delay array.
			// If cancel delaying an element or elements, get the data-activeid and see if it is in the delay array with the appropriate action we are
			// cancelling. If it is, we can add it. If not, then there is no need to add it.
			let activeIDArr = [];
			// Loop the secSels in the delayArr.
			Object.keys(delayArr).forEach(function(key) {
				if (['~', '|'].includes(key.substr(0, 1))) return;
				o.doc.querySelectorAll(key).forEach(function (obj, index) {
					activeIDArr.push(_getActiveID(obj));
				});
			});
			let activeID;
			if (typeof o.secSel == 'object') {
				// Only add it if there is an existing timeout scheduled for this action on this element.
				activeID = _getActiveID(o.secSel);
				if ((!cancelIDArr[activeID] || !cancelIDArr[activeID][func]) && activeIDArr.includes(activeID)) {
					_addCancelAttr(o.secSel, func);
				}
			} else {
				if (['~', '|'].includes(o.secSel.substr(0, 1))) {
					// If it's not in the delay arr we can ignore it.
					if (!delayArr[delayRef] || !delayArr[delayRef][func] || !delayArr[delayRef][func][o.actPos] || !delayArr[delayRef][func][o.actPos][o.intID] ||
						!delayArr[delayRef][func][o.actPos][o.intID][o.loopRef]) return;
					cancelCustomArr.push([o.secSel][func][o.actPos][o.intID][o.loopRef]);
				} else {
					o.doc.querySelectorAll(o.secSel).forEach(function (obj) {
						activeID = _getActiveID(obj);
						if ((!cancelIDArr[activeID] || !cancelIDArr[activeID][func]) && activeIDArr.includes(activeID)) {
							_addCancelAttr(obj, func);
						}
					});
				}
			}
		}
	}
};
