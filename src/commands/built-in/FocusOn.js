_a.FocusOn = o => { _focusOn(o); };

const _focusOn = (o, wot, justObj=false) => {
	let el, nodes, arr, useI, doClick = false, moveNum = 1, n, targEl, endOfField = false;
	// For previousCycle and nextCycle, as well as a selector, it also takes in the following parameters:
	// 2, 3 - this says how far to go forward or back.
	// click - clicks on the item
	let val = o.actVal;
	if (val.indexOf(' end-of-field') !== -1) {
		endOfField = true;
		val = val.replace(/ end-of-field/, '');
	}
	let startingFrom = _getParVal(val, 'starting-from');	// Need to write a better function for getting values like this at some point, should return the remaining actVal string with properties in object form.
	if (startingFrom !== '') val = val.substr(0, val.indexOf('starting-from')).trim();

	if (wot == 'pcc' || wot == 'ncc') {
		if (val.indexOf(' click') !== -1) {
			doClick = true;
			val = val.replace(/ click/, '');
		}
		val = val.replace(/ ([\d]+)( |$)?/gm, function(_, innards) {
			moveNum = innards;
			return '';
		});
		val = val.trim();
	}

	let map = [ 'l', 'n', 'p', 'nc', 'pc', 'ncc', 'pcc' ];
	if (map.indexOf(wot) !== -1) {
		if (wot != 'l') {
			arr = _getFocusedOfNodes(val, o, startingFrom);	// compares the focused element to the list and gives the position and returns the nodes. Could optimize this for when moveNum > 0.
			nodes = arr[0];
			useI = arr[1];
			if (wot == 'pcc' || wot == 'ncc') {
				if (moveNum > nodes.length) {
					moveNum = moveNum % nodes.length;	// Correct moveNum to be less than the actual length of the node list (it gets the remainder).
				}
			}
		} else {
			// This will only ever run once, as moveNum will always be one.
			let targArr = _splitIframeEls(val, o);
			if (!targArr) return false;	// invalid target.
			nodes = targArr[0].querySelectorAll(targArr[1]) || null;
		}
	}
	switch (wot) {
		case 'p':
		case 'pc':
		case 'pcc':
			if (wot == 'p') {
				if (useI === 0) return;
			} else {
				if (moveNum > useI) {
					// This move will take us back before 0.
					useI = nodes.length - moveNum - useI + 1;
				} else {
					useI = useI - moveNum + 1;
				}
			}
			el = nodes[useI - 1];
			break;
		case 'n':
		case 'nc':
		case 'ncc':
			if (wot == 'n') {
				if (useI == nodes.length - 1) return;
			} else {
				if (nodes.length <= moveNum + useI) {
					// This move will take us forward beyond the end.
					useI = moveNum + useI - nodes.length - 1;
				} else {
					useI = useI + moveNum - 1;
				}
			}
			el = nodes[useI + 1];
			break;
		case 'l':
			el = nodes[nodes.length - 1];
			break;
		default:
			el = _getSel(o, val);
	}
	if (!el) return;
	targEl = (el.tagName == 'FORM') ? el.elements[0] : el;
	if (doClick && (wot == 'pcc' || wot == 'ncc')) {
		ActiveCSS.trigger(targEl, 'click');
		setTimeout(function () {	// Needed for everything not to get highlighted when used in combination with select text area.
			if (endOfField && _isTextField(el)) {
				// Position cursor at end of line.
				_placeCaretAtEnd(el);
			} else {
				targEl.focus();
			}
		}, 0);
	} else if (!justObj) {
		if (o.func.substr(0, 5) == 'Click') {
			ActiveCSS.trigger(targEl, 'click');
		} else {
			if (endOfField && _isTextField(el)) {
				// Position cursor at end of line.
				_placeCaretAtEnd(el);
			} else {
				el.focus();
			}
		}
	}
	return targEl;
};
