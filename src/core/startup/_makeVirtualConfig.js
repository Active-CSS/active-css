const _makeVirtualConfig = (subConfig='', statement='', componentName=null, removeState=false, fileToRemove='') => {
	// Loop through the config, splitting up multi selectors and giving them their own entry. Put this into the config.
	// There is also now an option to remove a set of config settings declared in parsedConfig by setting the removeState par to true.
	let pConfig = (subConfig !== '') ? subConfig : parsedConfig;
	let str, strLength, i, strTrimmed, strTrimCheck, isComponent, innerContent, selectorName, evSplit, ev, sel, isConditional;
	let inlineActiveID = fileToRemove.substr(8);
	Object.keys(pConfig).forEach(function(key) {
		if (!pConfig[key].name) return;
		selectorName = pConfig[key].name;
		innerContent = pConfig[key].value;
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
						conditionals = _iterateConditionals(conditionals, innerContent, condName);
					} else {
						delete conditionals[condName];	// Safe removal. There is no length property on the conditionals object.
					}
					isConditional = true;
					break;

				case '@':
					if (strTrimmed == '@pages') {
						// This is a page list declaration. Append it to any others previously found.
						_iteratePageList(innerContent, removeState);
					} else if (isComponent) {
						// This is an html component. Stored like the conditional but in a different place.
						let compName = strTrimmed.split(' ')[1].trim();
						if (!removeState) {
							if (!components[compName]) components[compName] = {};
							components[compName].mode = null;
							components[compName].shadow = false;
							components[compName].scoped = false;
							components[compName].strictVars = false;
							components[compName].strictPrivEvs = false;
							components[compName].privVars = false;
							components[compName].privEvs = false;
							let checkStr = strTrimmed + ' ';
							// Does this have shadow DOM creation instructions? ie. shadow open or shadow closed. Default to open.
							if (checkStr.indexOf(' shadow ') !== -1) {
								components[compName].shadow = true;
								components[compName].mode = (strTrimmed.indexOf(' closed') !== -1) ? 'closed' : 'open';
							}
							if (checkStr.indexOf(' strictlyPrivateVars ') !== -1 || checkStr.indexOf(' strictlyPrivate ') !== -1) {
								components[compName].strictVars = true;
								components[compName].privVars = true;
								components[compName].scoped = true;
							} else if (checkStr.indexOf(' privateVars ') !== -1 || checkStr.indexOf(' private ') !== -1) {
								components[compName].privVars = true;
								// Private variable areas are always scoped, as they need their own area.
								// We get a performance hit with scoped areas, so we try and limit this to where needed.
								// The only other place we have an area scoped is where events are within components. Shadow DOM is similar but has its own handling.
								components[compName].scoped = true;
							}
							if (checkStr.indexOf(' strictlyPrivateEvents ') !== -1 || checkStr.indexOf(' strictlyPrivate ') !== -1) {
								components[compName].strictPrivEvs = true;
							} else if (checkStr.indexOf(' privateEvents ') !== -1 || checkStr.indexOf(' private ') !== -1) {
								components[compName].privEvs = true;
							}
						}
						// Recurse and set up componentness.
						_makeVirtualConfig(innerContent, '', compName, removeState, fileToRemove);
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
						// Check if the at-rule starts with @media or @support.
						let isMedia = (strTrimmed.substr(0, 7) == '@media ');
						let isSupport = (strTrimmed.substr(0, 9) == '@support ');
						if (isMedia || isSupport) {
							if (!removeState) {
								// This is a media query type of statement. Set it up and call the config routine again so the internal media query name can be attached to the events.
								statement = _setupMediaQueryHandler(strTrimmed);
								// Recurse and set up a conditional node.
								if (statement !== false) _makeVirtualConfig(innerContent, statement, null, removeState, fileToRemove);
								// Reset the media query name, otherwise this will get attached to all the remaining events.
							} else {
								// For the moment, media queries do not get deleted.
							}
							statement = '';
						} else {
							// This looks like a regular CSS at-rule.
							cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							continue;
						}
					}
					break;

				default:
					if (strTrimmed == 'html') {
						if (!removeState) {
							if (componentName) {
								// This is component html.
								components[componentName].data = innerContent[0].value.slice(1, -1);	// remove outer quotes;
								components[componentName].data = components[componentName].data.replace(/\\\"/g, '"');
								components[componentName].file = innerContent[0].file;
								components[componentName].line = innerContent[0].line;
								components[componentName].intID = innerContent[0].intID;
							}
						} else {
							if (componentName) delete components[componentName];
						}
					} else {
						// This is an event.
						// Could be colons in selector functions which we need to ignore in the split.
						// But there could be a colon at the beginning, in which case the first item in the array will be empty and it will not be an
						// internal conditional.
						evSplit = strTrimmed.split(/:(?![^\(\[]*[\]\)])/);

						// The first item in the array will always be the main selector, and the last will always be the event.
						// The middle can be a mixture of conditions.
						if (!evSplit[1]) {	// This has no split selector entry and could be a CSS command.
							// Is it contained inside a component declaration? If so, it's an error.
							if (componentName) {
								_warn(strTrimmed + ' is not a fully formed selector - it may be missing an event or have incorrect syntax. Or you have too many closing curly brackets.');
							} else {
								// This looks like a regular CSS command.
								cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							}
							continue;
						}
						if (evSplit[0] == '') {
							evSplit.shift();	// Get rid of the empty item.
							sel = ':' + evSplit.shift();	// Get the first selector part and put the colon back in.
						} else {
							sel = evSplit.shift();	// Get the first selector part (get the beginning clause and remove from array)
						}

						if (removeState) {
							if (sel == '~_inlineTag_' + inlineActiveID) {
								delete config[sel];
								continue;
							}
						}
						ev = evSplit.pop();	// Get the event (get the last clause and remove from array)
						ev = ev.trim();

						// Check that the event isn't a regular CSS command.
						if (ev.match(COLONSELS) && ev !== 'focus') {
							// This looks like a regular CSS command.
							cssExtractConcat({ file: innerContent[0].file, statement, selector: pConfig[key].name, commands: pConfig[key].value });
							continue;
						}

						let predefs = [], conds = [];
						if (evSplit.length > 0) {	// Only run this if there is anything left in the clause array.
							// Loop the remaining selectors, pop out each one and assign to the correct place in the config.
							// Ie. either after the selector for DOM queries, or as part of the conditional array that gets
							// attached to the event.
							let clause;
							for (clause of evSplit) {
								if (clause.match(COLONSELS)) {
									predefs.push(clause);
								} else {
									conds.push(clause);
								}
							}
						}
						// Does this need a media query conditional adding?
						if (statement !== '') {
							conds.push(statement);
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
							if (config[sel][ev][conditionName] === undefined) {
								config[sel][ev][conditionName] = [];
							}
						}

						if (!removeState) {
							config[sel][ev][conditionName].push(_iterateRules([], innerContent, sel, ev, conditionName, componentName));
						} else if (config[sel] !== undefined) {
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
