const _handleEvents = evObj => {
	let { obj, evType, onlyCheck, otherObj, eve, afterEv, origObj, origO, runButElNotThere, evScope, compDoc, _maEvCo } = evObj;
	let varScope, thisDoc;
	thisDoc = (compDoc) ? compDoc : document;
	let topVarScope = evObj.varScope;
	let component = (evObj.component) ? '|' + evObj.component : null;
	// Note: obj can be a string if this is a trigger, or an object if it is responding to an event.
	if (typeof obj !== 'string' && !obj || !selectors[evType] || evType === undefined) return false;	// No selectors set for this event.

	let selectorList = [];
	// Handle all selectors.
	let selectorListLen = selectors[evType].length;
	let i, testSel, debugNot = '', compSelCheckPos;
	if (evType == 'draw') obj._acssDrawn = true;	// Draw can manually be run twice, but not by the core as this is checked elsewhere.

	// These variables change during the event flow, as selectors found to run need to run in the appropriate component context.
	let componentRefs = { compDoc, topVarScope, evScope, component, strictPrivateEvs: strictCompPrivEvs[evScope], privateEvs: compPrivEvs[evScope] };
	let initialComponentRefs = componentRefs;

	let runGlobalScopeEvents = true;
	if (component && !(typeof obj !== 'string' && evType == 'draw' && customTags.indexOf(obj.tagName) !== -1)) {
		// Split for speed. It could be split into document/shadow areas to make even faster, at the times of adding config.
		// Don't bother optimizing by trying to remember the selectors per event the first time so they can be reused later on. Been down that route already.
		// The DOM state could change at any time, thereby potential changing the state of any object, and it's more trouble than it's worth to keep track of it
		// on a per object basis. It is fine as it is working dynamically. If you do have a go, you will need to consider things like routing affecting DOM
		// attributes, adding/removing attributes, properties, plus monitoring all objects for any external manipulation. It's really not worth it. This code is
		// short and fast enough on most devices.

		// Events have an additional action in Active CSS. They can bubble up per component. So a selector in a higher component will be inherited by a lower
		// component if the mode of the lower component is set to open. If set to closed, only that component's event will be processed. The developer can
		// stop this event hierarchy bubbling by using the Active CSS prevent-event-default action command. It's like DOM bubbling, but for events.
		// In a function-based language using native event listeners this would be confusing, but in Active CSS it makes *visual* sense to do this as we are
		// not using native event listeners. Which is nice.
		// This behaviour is exactly the same for shadow DOMs and non-shadow DOM components. It is *not* element bubbling. It is event bubbling.
		// Element bubbling follows native rules. In non-shadow DOM components element bubbling is not affected by the mode of the component.
		// There is a component tree array, which is used to track if we've hit the document in our references. If we have we bomb out after that.
		// This is all managed before running any events on an object. We make a valid event selector list first and then do the work.
		// This next bit creates the valid list.

		while (true) {
			for (i = 0; i < selectorListLen; i++) {
				let primSel = selectors[evType][i];
				compSelCheckPos = primSel.indexOf(':');
				if (primSel.substr(0, compSelCheckPos) !== componentRefs.component) continue;
				testSel = primSel.substr(compSelCheckPos + 1);
				if (typeof obj !== 'string' && testSel.substr(0, 1) == '~') continue;
				// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
				if (afterEv && origObj) {
					testSel = ActiveCSS._sortOutFlowEscapeChars(testSel);
					let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
						{
							str: testSel,
							obj: origObj
						}
					);
					strObj = _handleVars([ 'strings', 'scoped' ],
						{
							str: strObj.str,
						},
						strObj.ref
					);
					testSel = _resolveVars(strObj.str, strObj.ref);
				}
				if (testSel.indexOf('<') === -1 && !selectorList.includes(primSel)) {
				    if (testSel == '&') {
						selectorList.push({ primSel, componentRefs });
				    } else {
						if (typeof obj !== 'string') {
						    try {
								if (obj.matches(testSel)) {
									selectorList.push({ primSel, componentRefs });
						    	}
						    } catch(err) {
						        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
							}
						} else {
							if (obj == testSel) {
								selectorList.push({ primSel, componentRefs });
							}
						}
					}
				}
			}
			if (!componentRefs.strictPrivateEvs && ['beforeComponentOpen', 'componentOpen'].indexOf(evType) === -1) {
				componentRefs = _checkScopeForEv(componentRefs.evScope);
				if (componentRefs !== false) continue;
			} else {
				// This component is closed. We don't go any higher.
				runGlobalScopeEvents = false;
			}
			break;
		}
   	}
   	if (runGlobalScopeEvents) {
		componentRefs = initialComponentRefs;
		for (i = 0; i < selectorListLen; i++) {
			let primSel = selectors[evType][i];
			if (primSel.substr(0, 1) == '|' || typeof obj !== 'string' && primSel.substr(0, 1) == '~') continue;
			// Replace any attributes, etc. into the primary selector if this is an "after" callback event.
			if (afterEv && origObj) {
				testSel = ActiveCSS._sortOutFlowEscapeChars(primSel);
				let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
					{
						str: testSel,
						obj: origObj
					}
				);
				strObj = _handleVars([ 'strings', 'scoped' ],
					{
						str: strObj.str,
					},
					strObj.ref
				);
				testSel = _resolveVars(strObj.str, strObj.ref);
			} else {
				testSel = primSel;
			}

			if (testSel.indexOf('<') === -1 && !selectorList.includes(primSel)) {
				if (typeof obj !== 'string') {
				    try {
						if (obj.matches(testSel)) {
							selectorList.push({ primSel, componentRefs });
				    	}
				    } catch(err) {
				        console.log('Active CSS warning: ' + testSel + ' is not a valid CSS selector, skipping. (err: ' + err + ')');
					}
				} else {
					if (obj == testSel) {
						selectorList.push({ primSel, componentRefs });
					}
				}
			}
		}
	}

	if (typeof obj === 'string') {
		// handle events has been called with a string rather than an object in this case. Use the original real object if there is one.
		obj = (origObj) ? origObj : obj;
	}

	let sel, chilsObj;

	selectorListLen = selectorList.length;
	let actionName, ifrSplit, ifrObj, conds = [], cond, condSplit, passCond;
	let clause, clauseCo = 0, clauseArr = [];
	// All conditionals for a full event must be run *before* all actions, otherwise we end up with confusing changes within the same event which makes
	// setting conditionals inconsistent. Like checking if a div is red, then setting it to green, then checking if a div is green and setting it to red.
	// Having conditionals dynamically checked before each run of actions means the actions cancel out. So therein lies confusion. So all conditionals
	// must run for a specific event on a selector *before* all actions start.
	for (sel = 0; sel < selectorListLen; sel++) {
		let primSel = selectorList[sel].primSel;
		let { compDoc, topVarScope, evScope, component } = selectorList[sel].componentRefs;
		component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.
		if (config[primSel] && config[primSel][evType]) {
			if (onlyCheck) return true;	// Just checking something is there. Now we have established this, go back.
			for (clause in config[primSel][evType]) {
				clauseCo++;
				if (clause != '0' && _passesConditional(obj, sel, clause, evType, otherObj, thisDoc, topVarScope, component, eve, compDoc)) {
					// This condition passed. Remember it for the next bit.
					clauseArr[clauseCo] = clause;
				}
			}
		}
	}
	clauseCo = 0;

	eventLoop: {
		for (sel = 0; sel < selectorListLen; sel++) {
			let primSel = selectorList[sel].primSel;
			let { compDoc, topVarScope, evScope, component } = selectorList[sel].componentRefs;
			component = (component) ? component.substr(1) : null;	// we don't want to pass around the pipe | prefix.
			if (config[primSel] && config[primSel][evType]) {
				for (clause in config[primSel][evType]) {
					clauseCo++;
					passCond = '';
					if (clause != '0') {	// A conditional is there.
						if (clauseArr[clauseCo] === undefined) continue;	// The conditional failed earlier.
						// This conditional passed earlier - we can run it.
						passCond = clauseArr[clauseCo];
					}
					chilsObj = config[primSel][evType][clause];
					if (chilsObj !== false) {
						// Secondary selector loops go here.
						let secSelLoops, loopObj;
						for (secSelLoops in chilsObj) {
							loopObj = {
								primSel,
								chilsObj,
								originalLoops: secSelLoops,
								secSelLoops,
								obj,
								compDoc,
								evType,
								varScope: topVarScope,
								evScope,
								evObj,
								otherObj,
								origO,
								passCond,
								sel,
								component,
								selectorList,
								eve,
								_maEvCo,
								runButElNotThere
							};
							_performSecSel(loopObj);
							if (typeof maEv[_maEvCo] !== 'undefined' && maEv[_maEvCo]._acssStopImmedEvProp) {
								break eventLoop;
							}
						}
					}
				}
			}
		}
	}

	return true;
};
