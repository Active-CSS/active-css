const _miniHandleEventForEditor = evObj => {
	let obj = evObj.obj;
	let thisAction = evObj.thisAction;
	let component = (evObj.component) ? '|' + evObj.component : null;

	let selectorList = [], thisItem = {}, found = false;
	let selectorListLen = selectors[thisAction].length;
	let i, testSel, sel, compSelCheckPos;

	if (component) {
		for (i = 0; i < selectorListLen; i++) {
			compSelCheckPos = selectors[thisAction][i].indexOf(':');
			if (selectors[thisAction][i].substr(0, compSelCheckPos) !== component) continue;
			testSel = selectors[thisAction][i].substr(compSelCheckPos + 1);
			if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[thisAction][i])) {
			    if (testSel == '&') {
					selectorList.push(selectors[thisAction][i]);
			    } else {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push(selectors[thisAction][i]);
				    	}
				    } catch(err) {
					}
				}
			}
		}
	} else {
		for (i = 0; i < selectorListLen; i++) {
			if (['~', '|'].includes(selectors[thisAction][i].substr(0, 1))) continue;
			testSel = selectors[thisAction][i];
			if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[thisAction][i])) {
				try {	// Needs to be a try/catch as we might some strangely syntaxed element input, and we want it not to continue.
					if (obj.matches(testSel)) {	// ~ check handles external trigger on clash between custom event and custom selector.
						selectorList.push(selectors[thisAction][i]);
					}
				} catch(err) {
				}
			}
		}
	}
	selectorListLen = selectorList.length;
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][thisAction]) {
			if (!thisItem[selectorList[sel]]) {
				thisItem[selectorList[sel]] = {};
			}
			thisItem[selectorList[sel]] = config[selectorList[sel]][thisAction];
			found = true;
		}
	}
	return [ thisItem, found ];
};
