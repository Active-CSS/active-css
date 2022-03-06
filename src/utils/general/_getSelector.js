const _getSelector = (o, sel, many=false) => {
	let newDoc;
	if (o.compDoc) {
		// Use the default shadow doc. This could be a componentOpen, and unless there's a split selector involved, we need to default to the shadow doc provided.
		newDoc = o.compDoc;
		if (newDoc && newDoc.nodeType !== Node.DOCUMENT_NODE) {
			let compDetails = _getComponentDetails(newDoc);
			newDoc = compDetails.topEvDoc;
			if (compDetails.inheritEvDoc) {
				let checkPrimSel = (o.primSel && o.primSel.startsWith('~') && o.origO && o.origO.primSel) ? o.origO.primSel : o.primSel;
				if (!o.component || !checkPrimSel || checkPrimSel.indexOf('|' + o.component + ':') === -1) {
					newDoc = compDetails.inheritEvDoc;
				}
			}
		}
	} else {
		newDoc = o.doc || document;
	}
	if (sel.startsWith('~')) {
		return { doc: newDoc, obj: sel };
	}

	// This is a consolidated selector grabber which should be used everywhere in the core that needs ACSS special selector references.
	let item = false;

	// In order not to break websites when CSS gets enhanced, it's necessary to take full responsibility for the special ACSS selectors and deal with
	// them internally so that native behaviour doesn't change things later.

	// Escape any &, < or ... that are in double-quotes. These will need to be individually unescaped at each iteration that uses a queryselector.
	let newSel = sel.replace(/("(.*?)")/g, function(_, innards) {
		innards = innards.replace(/&/g, '_acss*a t*')
			.replace(/\-\>/g, '_acss*s*i n')
			.replace(/</g, '_acss*s*l s')
			.replace(/me/g, '_acss*s*m e')
			.replace(/this/g, '_acss*s*t h')
			.replace(/self/g, '_acss*s*s e');
		return innards;
	});

	let attrActiveID, n, selItem, compDetails, elToUse;
	let obj = o.secSelObj || o.obj;

	if ((
			newSel.indexOf('&') !== -1 ||
			/\bself\b/.test(newSel) ||
			/\bme\b/.test(newSel) ||
			/\bthis\b/.test(newSel)
			) && (typeof obj === 'object')
		) {
		elToUse = obj;
		attrActiveID = _getActiveID(elToUse);

		// Add the data-activeid attribute so we can search with it. We're going to remove it after. It keeps it all quicker than manual DOM traversal.
		let repStr = '[data-activeid=' + attrActiveID + ']';
		if (newSel.indexOf('&') !== -1) newSel = newSel.replace(/&/g, repStr);
		if (newSel.indexOf('self') !== -1) newSel = newSel.replace(/\bself\b/g, repStr);
		if (newSel.indexOf('me') !== -1) newSel = newSel.replace(/\bme\b/g, repStr);
		if (newSel.indexOf('this') !== -1) newSel = newSel.replace(/\bthis\b/g, repStr);
		if (newSel == repStr) return { doc: newDoc, obj: selManyize(obj, true) };
		elToUse.setAttribute('data-activeid', attrActiveID);
	}

	// The string selector should now be fully iterable if we split by " -> " and "<".
	let selSplit = newSel.split(/( \-> |<)/);

	let mainObj = obj;

	let selSplitLen = selSplit.length;
	let selectWithClosest = false;
	let justFoundIframe = false;
	let singleResult = false;
	let multiResult = false;
	let justSetIframeAsDoc = false;

	for (n = 0; n < selSplitLen; n++) {
		selItem = unescForSel(selSplit[n]);

		if (justFoundIframe !== false && selItem == ' -> ') {
			// We are drilling into an iframe next.
			newDoc = justFoundIframe;
			justFoundIframe = false;
			justSetIframeAsDoc = true;
			continue;
		} else {
			justFoundIframe = false;
		}
		singleResult = false;
		multiResult = false;
		switch (selItem) {
			case 'window':
				mainObj = window;
				newDoc = document;
				singleResult = true;
				break;

			case 'body':
				mainObj = (justSetIframeAsDoc) ? newDoc.body : document.body;
				newDoc = (justSetIframeAsDoc) ? newDoc : document;
				singleResult = true;
				break;

			case 'document':	// Special ACSS selector
			case ':root':	// Special ACSS selector
				newDoc = (justSetIframeAsDoc) ? newDoc : document;
				mainObj = newDoc;
				singleResult = true;
				break;

			case 'shadow':		// Special ACSS selector
				if (mainObj) {
					let thisNode = mainObj.length == 1 ? mainObj[0] : mainObj;
					if (thisNode) newDoc = thisNode.shadowRoot;
					mainObj = newDoc;
					singleResult = true;
				}
				break;

			case 'parent':		// Special ACSS selector
				// Get object root details.
				compDetails = _getComponentDetails(o.compDoc);
				if (!compDetails.topEvDoc || window.parent.document) {
					newDoc = window.parent.document;
				} else if (!newDoc.isSameNode(compDetails.topEvDoc)) {
					newDoc = compDetails.topEvDoc;
				}
				mainObj = newDoc;
				singleResult = true;
				break;

			case 'host':		// Special ACSS selector
			case ':host':
				compDetails = _getComponentDetails(o.compDoc);
				if (['beforeComponentOpen', 'componentOpen'].indexOf(o.event) !== -1) {
					// The host is already being used as the target selector with these events.
				} else {
					let rootNode = _getRootNode(mainObj.length == 1 ? mainObj[0] : mainObj);
					mainObj = (rootNode._acssScoped) ? rootNode : rootNode.host;
				}
				singleResult = true;
				break;

			case ' -> ':
				break;

			case '<':
				selectWithClosest = true;
				continue;

			default:
				if (selectWithClosest) {
					// Get closest nextSel to the current element, but we want to start from the parent. Note that this will always only bring back one node.
					if (mainObj) mainObj = (mainObj.length == 1 ? mainObj[0] : mainObj).parentElement;
					if (!mainObj) break;
					mainObj = mainObj.closest(selItem);
					singleResult = true;
				} else {
					try {
						mainObj = newDoc.querySelectorAll(selItem);
						if (!mainObj) {
							if (newDoc.nodeType !== Node.DOCUMENT_NODE) {
								if (newDoc.matches(selItem)) {
									mainObj = newDoc;
								}
							}
						}
							
					} catch(err) {
						if (attrActiveID) elToUse.removeAttribute('data-activeid');
						return { obj: undefined, newDoc };
					}
					multiResult = true;
				}
				if (justFoundIframe === false) {
					if (mainObj && mainObj.length == 1 && mainObj[0].tagName == 'IFRAME') {
						justFoundIframe = mainObj[0].contentWindow.document;
						continue;
					}
				}
				justFoundIframe = false;
		}
		// Reset closest flag so it only happens the once.
		selectWithClosest = false;
		justSetIframeAsDoc = false;
	}

	let res = { doc: newDoc, obj: selManyize(mainObj, singleResult, multiResult) };

	if (attrActiveID) elToUse.removeAttribute('data-activeid');

	function unescForSel(sel) {
		let newSel = sel.replace(/("(.*?)")/g, function(_, innards) {
			innards = innards.replace(/_acss\*a t\*/g, '&')
				.replace(/_acss\*s\*i n/g, '->')
				.replace(/_acss\*s\*l s/g, '<')
				.replace(/_acss\*s\*m e/g, 'me')
				.replace(/_acss\*s\*t h/g, 'this')
				.replace(/_acss\*s\*s e/g, 'self');
			return innards;
		});
		return newSel;
	}

	function selManyize(mainObj, singleResult, multiResult) {
		if (many) {
			if (singleResult) {
				return [ mainObj ];
			}
		} else {
			if (multiResult) {
				return mainObj[0];
			}
		}
		return mainObj;
	}

	return res;
};
