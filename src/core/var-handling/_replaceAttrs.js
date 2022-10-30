// Replace attributes if they exist. Also the {$RAND}, as that is safe to run in advance. This is run at multiple stages at different parts of the runtime
// config on different objects as they are needed. Also replace JavaScript expressions {= expression}.
// Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.

const _replaceAttrs = (obj, sel, secSelObj=null, o=null, func='', varScope=null, evType='', varReplacementRef=-1) => {
	// Note, obj could sometimes be a string with no attributes if this is a trigger.
	// For this to be totally safe, we escape the contents of the attribute before inserting.
	if (!sel) return '';
	if (sel.indexOf('{@') !== -1) {
		sel = sel.replace(/__acssVAssigned\%\%/g, '');
		sel = sel.replace(/\{\@(\@?[^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let getProperty = false;
			let realWot = wot;
			if (wot.startsWith('@')) {
				getProperty = true;
				wot = wot.substr(1);
			}
			let wotArr = wot.split('.'), ret;
			if (wotArr[1] && wotArr[0] == 'selected' && obj.tagName == 'SELECT') {
				// If selected is used, like [selected.value], then it gets the attribute of the selected option, rather than the select tag itself.
				ret = _getAttrOrProp(obj, wotArr[1], getProperty, obj.selectedIndex, func);
				if (ret !== false) return _preReplaceVar(_escapeQuo(ret), varReplacementRef, func);
			} else {
				let colon = wot.lastIndexOf(':');	// Get the last colon - there could be colons in the selector itself.
				let res;
				if (colon !== -1) {
					// This should be an id followed by an attribute, or innerText, or it's a shadow DOM host attribute.
					let elRef = wot.substr(0, colon), el;
					let compOpenArr = ['beforeComponentOpen', 'componentOpen'];
					if (elRef == 'host') {
						let oEvIsCompOpen = (o && (compOpenArr.indexOf(o.event) !== -1 || o.origO && compOpenArr.indexOf(o.origO.event) !== -1));
						if (compOpenArr.indexOf(evType) !== -1 || oEvIsCompOpen) {
							// This has come in from beforeComponentOpen or componentOpen in passesConditional and so obj is the host before render.
							// o.origO handles coming from a trigger event from these component opening events.
							el = obj;
						} else if (o && o.compDoc && o.compDoc.nodeType == Node.ELEMENT_NODE) {
							el = o.compDoc;
						} else if (!o || !oEvIsCompOpen) {
							if (obj.shadowRoot) {
								el = obj.shadowRoot;
							} else {
								return '{@' + wot + '}';	// Need to leave this alone. We can't handle this yet. This can be handled in scopedProxy.
							}
						}
					} else {
						el = _getSel(o, elRef);
					}
					let wat = wot.substr(colon + 1);
					if (el.tagName == 'IFRAME' && wat == 'url') {
						// If this is an iframe and the virtual attribute url is chosen, get the actual url inside the iframe.
						// We can't rely on the src of the iframe element being accurate, as it is not always updated.
						return _preReplaceVar(_escapeItem(el.contentWindow.location.href, varReplacementRef), func);
					} else {
						res = checkAttrProp(el, wat, getProperty, func);
						if (res !== false) return res;
					}
				} else {
					res = checkAttrProp(secSelObj, wot, getProperty, func, varReplacementRef);
					if (res !== false) return res;
					res = checkAttrProp(obj, wot, getProperty, func, varReplacementRef);
					if (res !== false) return res;
					// Check if there is an origO object from a trigger to check the calling target selector or event selector elements.
					if (o && o.origO) {
						res = checkAttrProp(o.origO.secSelObj, wot, getProperty, func, varReplacementRef);
						if (res !== false) return res;
						res = checkAttrProp(o.origO.obj, wot, getProperty, func, varReplacementRef);
						if (res !== false) return res;
					}
				}
			}
			if (func == 'Var' && !wot.startsWith('host')) {

//console.log('_replaceAttrs, realWot:', realWot);

				// Assume it isn't ready to be evaluated. Useful for presetting on variable assignment. Encrypt a bit, but only to stop someone accidentally typing
				// it in user content - there is no security risk with this, because any attribute referenced is on the page already.
				return '{@__acssVAssigned%%' + realWot + '}';
			} else {
				return '';	// More useful to return an empty string. '{@' + wot + '>';
			}
		});
	}
	function checkAttrProp(el, wot, getProperty, func, varReplacementRef) {
		if (el && el.nodeType == Node.ELEMENT_NODE) {
			let ret = _getAttrOrProp(el, wot, getProperty, null, func);
			if (ret !== false) return _preReplaceVar(_escapeQuo(ret, func), varReplacementRef, func);
		}
		return false;
	}
	return sel;
};
