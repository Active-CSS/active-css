// Replace attributes if they exist. Also the {$RAND}, as that is safe to run in advance. This is run at multiple stages at different parts of the runtime
// config on different objects as they are needed. Also replace JavaScript expressions {= expression}.
// Any variables not found will be searched for in higher scopes and referenced by that scope if found, unless component is marked as strictlyPrivateVars.

const _replaceAttrs = (obj, sel, secSelObj=null, o=null, func='', varScope=null, evType='', varReplacementRef=-1) => {
	// Note, obj could sometimes be a string with no attributes if this is a trigger.
	// For this to be totally safe, we escape the contents of the attribute before inserting.
	if (!sel) return '';
	if (sel.indexOf('{@') !== -1) {
		sel = sel.replace(/\{\@(\@?[^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let getProperty = false;
			if (wot.startsWith('@')) {
				getProperty = true;
				wot = wot.substr(1);
			}
			let wotArr = wot.split('.'), ret, err = [];
			if (wotArr[1] && wotArr[0] == 'selected' && obj.tagName == 'SELECT') {
				// If selected is used, like [selected.value], then it gets the attribute of the selected option, rather than the select tag itself.
				ret = _getAttrOrProp(obj, wotArr[1], getProperty, obj.selectedIndex);
				if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef);
				err.push('Neither attribute or property ' + wotArr[1] + ' found in target or primary selector:');
			} else {
				let colon = wot.lastIndexOf(':');	// Get the last colon - there could be colons in the selector itself.
				if (colon !== -1) {
					// This should be an id followed by an attribute, or innerText, or it's a shadow DOM host attribute.
					let elRef = wot.substr(0, colon), el;
					let compOpenArr = ['beforeComponentOpen', 'componentOpen'];
					if (elRef == 'host') {
						let oEvIsCompOpen = (o && compOpenArr.indexOf(o.event) !== -1);
						if (compOpenArr.indexOf(evType) !== -1 || oEvIsCompOpen) {
							// This has come in from beforeComponentOpen or componentOpen in passesConditional and so obj is the host before render.
							el = obj;
						} else if (!o || !oEvIsCompOpen) {
							if (!obj.shadowRoot) return '{@' + wot + '}';	// Need to leave this alone. We can't handle this yet. This can be handled in scopedProxy.
							el = obj.shadowRoot;
						}
					} else {
						el = _getSel(o, elRef);
					}
					let wat = wot.substr(colon + 1);
					if (el.tagName == 'IFRAME' && wat == 'url') {
						// If this is an iframe and the virtual attribute url is chosen, get the actual url inside the iframe.
						// We can't rely on the src of the iframe element being accurate, as it is not always updated.
						return _preReplaceVar(_escapeItem(el.contentWindow.location.href, varReplacementRef));
					} else {
						ret = _getAttrOrProp(el, wat, getProperty);
						if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef);
						err.push('Neither attribute or property ' + wat + ' found in target or primary selector:');
					}
				} else {
					if (obj && typeof obj !== 'string') {
						if (secSelObj) {
							ret = _getAttrOrProp(secSelObj, wot, getProperty);
							if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef);
						}
						ret = _getAttrOrProp(obj, wot, getProperty);
						if (ret) return _preReplaceVar(_escapeQuo(ret), varReplacementRef);
						err.push('Attribute not property ' + wot + ' found in target or primary selector:');
					}
				}
			}
			if (err) err.push(obj);
			return '';	// More useful to return an empty string. '{@' + wot + '>';
		});
	}
	return sel;
};
