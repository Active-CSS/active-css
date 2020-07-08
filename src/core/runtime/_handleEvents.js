const _handleEvents = evObj => {
	let obj = evObj.obj;
	let evType = evObj.evType;
	let onlyCheck = evObj.onlyCheck;
	let otherObj = evObj.otherObj;
	let eve = evObj.eve;
	let afterEv = evObj.afterEv;
	let origObj = evObj.origObj;
	let runButElNotThere = evObj.runButElNotThere;
	let compRef, thisDoc;
	let compDoc = evObj.compDoc;
	thisDoc = (compDoc) ? compDoc : document;
	let topCompRef = evObj.compRef;
	let component = (evObj.component) ? '|' + evObj.component : null;
	// Note: obj can be a string if this is a trigger, or an object if it is responding to an event.
	if (typeof obj !== 'string' && !obj || !selectors[evType] || typeof evType === 'undefined') return false;	// No selectors set for this event.
	let selectorList = [];
	// Handle all selectors.
	let selectorListLen = selectors[evType].length;
	let i, testSel, debugNot = '', compSelCheckPos;
	if (typeof obj !== 'string') {
		if (component) {
			// Split for speed. It could be split into document/shadow areas to make even faster, at the times of adding config.
			// Don't bother optimizing by trying to remember the selectors per event the first time so they can be reused later on. Been down that route already.
			// The DOM state could change at any time, thereby potential changing the state of any object, and it's more trouble than it's worth to keep track of it
			// on a per object basis. It is fine as it is working dynamically. If you do have a go, you will need to consider things like routing affecting DOM
			// attributes, adding/removing attributes, properties, plus monitoring all objects for any external manipulation. It's really not worth it. This code is
			// short and fast enough on most devices.
			for (i = 0; i < selectorListLen; i++) {
				compSelCheckPos = selectors[evType][i].indexOf(':');
				if (selectors[evType][i].substr(0, compSelCheckPos) !== component) continue;
				testSel = selectors[evType][i].substr(compSelCheckPos + 1);
				// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
				testSel = (afterEv && origObj) ? _replaceAttrs(origObj, testSel) : testSel;
				if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[evType][i])) {
				    if (testSel == '&') {
						selectorList.push(selectors[evType][i]);
				    } else {
					    try {
							if (obj.matches(testSel)) {
								selectorList.push(selectors[evType][i]);
					    	}
					    } catch(err) {
					        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
						}
					}
				}
			}
    	} else {
			for (i = 0; i < selectorListLen; i++) {
				if (['~', '|'].includes(selectors[evType][i].substr(0, 1))) continue;
				// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
				testSel = (afterEv && origObj) ? _replaceAttrs(origObj, selectors[evType][i]) : selectors[evType][i];
				if (testSel.indexOf('<') === -1 && !selectorList.includes(selectors[evType][i])) {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push(selectors[evType][i]);
				    	}
				    } catch(err) {
				        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
					}
				}
			}
		}
	} else {
		// This has taken in a string to select - just search for that string. Note this could be a shadow DOM element, which for speed has come in as a string sel.
		selectorList.push(obj);
		obj = (origObj) ? origObj : obj;
	}
		
	let sel, chilsObj;
	component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.

	selectorListLen = selectorList.length;
	let actionName, ifrSplit, ifrObj, conds = [], cond, condSplit, passCond;
	let clause, clauseCo = 0, clauseArr = [];
	// All conditionals for a full event must be run *before* all actions, otherwise we end up with confusing changes within the same event which makes
	// setting conditionals inconsistent. Like checking if a div is red, then setting it to green, then checking if a div is green and setting it to red.
	// Having conditionals dynamically checked before each run of actions means the actions cancel out. So therein lies confusion. So all conditionals
	// must be for a specific event on a selector *before* all actions. We get two "for" loops, but I don't see an alternative right now.
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][evType]) {
			if (onlyCheck) return true;	// Just checking something is there. Now we have established this, go back.
			for (clause in config[selectorList[sel]][evType]) {
				clauseCo++;
				if (clause != '0' && _passesConditional(obj, sel, clause, evType, otherObj, thisDoc, topCompRef, component, eve, compDoc)) {
					// This condition passed. Remember it for the next bit.
					clauseArr[clauseCo] = clause;
				}
			}
		}
	}
	clauseCo = 0;
	for (sel = 0; sel < selectorListLen; sel++) {
		if (config[selectorList[sel]] && config[selectorList[sel]][evType]) {
			for (clause in config[selectorList[sel]][evType]) {
				clauseCo++;
				passCond = '';
				if (clause != '0') {	// A conditional is there.
					if (typeof clauseArr[clauseCo] == 'undefined') continue;	// The conditional failed earlier.
					// This conditional passed earlier - we can run it.
					passCond = clauseArr[clauseCo];
				}
				chilsObj = config[selectorList[sel]][evType][clause];
				if (chilsObj !== false) {
					// Secondary selector loops go here.
					let secSelLoops, loopObj;
					for (secSelLoops in chilsObj) {
						loopObj = {
							chilsObj,
							originalLoops: secSelLoops,
							secSelLoops,
							obj,
							compDoc,
							evType,
							compRef: topCompRef,
							evObj,
							otherObj,
							passCond,
							sel,
							component,
							selectorList,
							eve,
							runButElNotThere
						};
						if (secSelLoops != '0') {
							// Process any secondary selector loops and anything else.
							_processSecSelLoops(loopObj);
						} else {
							// No secondary selector loops. Just run the action setup.
							_performSecSel(loopObj);
						}
					}
				}
			}
		}
	}
	return true;
};
