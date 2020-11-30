const _makeVirtualConfig = (subConfig='', mqlName='', componentName=null, removeState=false, fileToRemove='') => {
	// Loop through the config, splitting up multi selectors and giving them their own entry. Put this into the config.
	// There is also now an option to remove a set of config settings declared in parsedConfig by setting the removeState par to true.
	var pConfig = (subConfig !== '') ? subConfig : parsedConfig;
	var str, strLength, i, strTrimmed, strTrimCheck, isComponent;
	var selectorName, evSplit, ev, sel, isConditional;
	let inlineActiveID = fileToRemove.substr(8);
	Object.keys(pConfig).forEach(function(key) {
		if (!pConfig[key].name) return;
		selectorName = pConfig[key].name;
		isConditional = false;
		// Split by comma, but not any that are in parentheses, as those are in selector functions.
		str = selectorName.split(/,(?![^\(\[]*[\]\)])/);
		strLength = str.length;
		for (i = 0; i < strLength; i++) {
			strTrimmed = str[i].trim();
			// This could be a component that has an event, so we force the below to skip recognising this as a component.
			isComponent = (strTrimmed.substr(0, 11) == '@component ');
			// First check if this is a part of a comma-delimited list of conditionals, then do other stuff to set up for the switch statement.
			// It could look like '?cheese, ?trevor' or '?cheese, trevor', and they would all be conditionals, so these next lines cater for a missing ?.
			let noQuestionMark;
			strTrimCheck = (isConditional && (noQuestionMark = strTrimmed.indexOf('?') === -1)) ? '?' : (!isComponent || isComponent && str[i].indexOf(':') === -1) ? strTrimmed.slice(0, 1) : '';
			switch (strTrimCheck) {
				case '?':
					// This is a conditional. This puts the conditional in memory for later use.
					// When it comes to trapping the use of the conditional, the reference to it is set in the config
					// for the event, so that is also part of setting up the config.
					let condName = (noQuestionMark) ? strTrimmed : strTrimmed.substr(1);
					if (componentName) {
						condName = '|' + componentName + '|' + condName;
					}
					if (!removeState) {
						conditionals[condName] = (conditionals[condName] === undefined) ? [] : conditionals[condName];
						conditionals = _iterateConditionals(conditionals, pConfig[key].value, condName);
					} else {
						delete conditionals[condName];	// Safe removal. There is no length property on the conditionals object.
					}
					isConditional = true;
					break;

				case '@':
					if (strTrimmed == '@pages') {
						// This is a page list declaration. Append it to any others previously found.
						_iteratePageList(pConfig[key].value, removeState);
					} else if (isComponent) {
						// This is an html component. Stored like the conditional but in a different place.
						let compName = strTrimmed.split(' ')[1].trim();
						if (!removeState) {
							if (!components[compName]) components[compName] = {};
							components[compName].mode = null;
							components[compName].shadow = false;
							components[compName].scoped = false;
							components[compName].privEvs = false;
							let checkStr = strTrimmed + ' ';
							// Does this have shadow DOM creation instructions? ie. shadow open or shadow closed. Default to open.
							if (checkStr.indexOf(' shadow ') !== -1) {
								components[compName].shadow = true;
								components[compName].mode = (strTrimmed.indexOf(' closed') !== -1) ? 'closed' : 'open';
							}
							if (checkStr.indexOf(' private ') !== -1 || checkStr.indexOf(' privateVars ') !== -1) {	// "private" is deprecated as of v2.4.0
								components[compName].privVars = true;
								// Private variable areas are always scoped, as they need their own area.
								// We get a performance hit with scoped areas, so we try and limit this to where needed.
								// The only other place we have an area scoped is where events are within components. Shadow DOM is similar but has its own handling.
								components[compName].scoped = true;
							}
							if (checkStr.indexOf(' privateEvents ') !== -1) {
								components[compName].privEvs = true;
							}
						}
						// Recurse and set up componentness.
						_makeVirtualConfig(pConfig[key].value, '', compName, removeState, fileToRemove);
						if (!removeState) {
							// Handle no html content.
							if (components[compName].data === undefined) {
								components[compName].data = '';
								components[compName].file = '';
								components[compName].line = '';
								components[compName].intID = '';
							}
							// Reset the component name, otherwise this will get attached to all the remaining events.
						} else {
							delete components[compName];
						}
						compName = '';
					} else {
						if (!removeState) {
							// This is a media query. Set it up and call the config routine again so the internal media query name can be attached to the events.
							mqlName = _setupMediaQueryHandler(strTrimmed.slice(7).trim());
							// Recurse and set up a conditional node.
							_makeVirtualConfig(pConfig[key].value, mqlName, null, removeState, fileToRemove);
							// Reset the media query name, otherwise this will get attached to all the remaining events.
						} else {
							// For the moment, media queries do not get deleted.
						}
						mqlName = '';
					}
					break;

				default:
					if (strTrimmed == 'html') {
						if (!removeState) {
							if (componentName) {
								// This is component html.
								components[componentName].data = pConfig[key].value[0].value.slice(1, -1);	// remove outer quotes;
								components[componentName].data = components[componentName].data.replace(/\\\"/g, '"');
								components[componentName].file = pConfig[key].value[0].file;
								components[componentName].line = pConfig[key].value[0].line;
								components[componentName].intID = pConfig[key].value[0].intID;
							}
						} else {
							if (componentName) delete components[componentName];
						}
					} else {
						// This is an event.
						// Could be colons in selector functions which we need to ignore in the split.
						evSplit = strTrimmed.split(/:(?![^\(\[]*[\]\)])/);
						// The first item in the array will always be the main selector, and the last will always be the event.
						// The middle can be a mixture of conditions.
						if (!evSplit[1]) {	// This has no split selector entry and is an error.
							console.log('"' + selectorName + '" ' + strTrimmed + ' is not a fully formed selector - it may be missing an event or have incorrect syntax. Or you have too many closing curly brackets.');
							continue;
						}
						sel = evSplit.shift();	// Get the main selector (get the beginning clause and remove from array)

						if (removeState) {
							if (sel == '~_inlineTag_' + inlineActiveID) {
								delete config[sel];
								continue;
							}
						}
						ev = evSplit.pop();	// Get the event (get the last clause and remove from array)
						ev = ev.trim();

						let predefs = [], conds = [];
						if (evSplit) {	// Only run this if there is anything left in the clause array.
							// Loop the remaining selectors, pop out each one and assign to the correct place in the config.
							// Ie. either after the selector for DOM queries, or as part of the conditional array that gets
							// attached to the event.
							let re, clause;
							for (clause of evSplit) {
								re = new RegExp(COLONSELS, 'g');
								if (re.test(clause)) {
									predefs.push(clause);
								} else {
									conds.push(clause);
								}
							}
						}
						// Does this need a media query conditional adding?
						if (mqlName !== '') {
							conds.push(mqlName);
						}
						if (predefs.length > 0) {
							sel += ':' + predefs.join(':');	// Put the valid DOM selector clauses back.
						}
						// Set up the event in the config.
						// If this is an event for a component, it gets a special handling compared to the main document. It gets a component prefix.
						if (componentName) {
							sel = '|' + componentName + ':' + sel;
							if (!removeState) {
								shadowSels[componentName] = (shadowSels[componentName] === undefined) ? [] : shadowSels[componentName];
								shadowSels[componentName][ev] = true;	// We only want to know if there is one event type per shadow.


// This is wrong. All components must not be scoped. Scoped refers to the data-active-scoped attribute that should be just for variables.
// Event scoping is something else and that needs to be kept *separate*.

								// Targeted events get set up only when a shadow is drawn, as they are attached to the shadow, not the document. No events to set up now.
								// All non-shadow components are now scoped so that events can occur in any component, if there are any events.
								components[componentName].scoped = true;



							} else {
								delete shadowSels[componentName];
								delete components[componentName];
							}
						}

						if (!removeState) {
							config[sel] = (config[sel] === undefined) ? {} : config[sel];
							config[sel][ev] = (config[sel][ev] === undefined) ? {} : config[sel][ev];
						}

						let conditionName;
						if (conds.length === 0) {
							conditionName = 0;
						} else {
							// Concat the conditions with a space.
							conditionName = conds.join(' ');
						}

						if (!removeState) {
							preSetupEvents.push({ ev, sel });
							if (config[sel] === undefined) {	// needed for DevTools.
								config[sel] = {};
							}
							if (config[sel][ev] === undefined) {	// needed for DevTools.
								config[sel][ev] = {};
							}
							if (config[sel][ev][conditionName] === undefined) {
								config[sel][ev][conditionName] = [];
							}
						}

						if (!removeState) {
							config[sel][ev][conditionName].push(_iterateRules([], pConfig[key].value, sel, ev, conditionName, componentName));
						} else {
							// Find and remove items from config based on file value.
							let i, len = config[sel][ev][conditionName].length;
							let toRemove = [];
							for (i = 0; i < len; i++) {
								if (_isFromFile(fileToRemove, config[sel][ev][conditionName][i])) {
									toRemove.push(i);
								}
							}
							for (i of toRemove) {
								config[sel][ev][conditionName].splice(i, 1);
							}
							if (config[sel][ev][conditionName].length == 0) {
								delete config[sel][ev][conditionName];
							}
							if (Object.keys(config[sel][ev]).length === 0) {
								delete config[sel][ev];
							}
							if (Object.keys(config[sel]).length === 0) {
								delete config[sel];
							}
						}
					}
			}
		}
	});
	if (subConfig !== '') return;		// Return the sub-config - we just handled media query contents.

	let debugConfig = (debugMode) ? _doDebug('config') : false;
	if (debugConfig) {
		Object.keys(config).sort().forEach(function(key) {
			console.log(key, config[key]);
		});
	}
	debugConfig = (debugMode) ? _doDebug('conditionals') : false;
	if (debugConfig) {
		Object.keys(conditionals).sort().forEach(function(key) {
			console.log(key, conditionals[key]);
		});
	}
	debugConfig = (debugMode) ? _doDebug('components') : false;
	if (debugConfig) {
		Object.keys(components).sort().forEach(function(key) {
			console.log(key, components[key]);
		});
	}
};
