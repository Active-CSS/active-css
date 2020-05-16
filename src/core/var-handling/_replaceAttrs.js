// Replace attributes if they exist. Also the {$RAND}, as that is safe to run in advance. This is run at multiple stages at different parts of the runtime
// config on different objects as they are needed. Also replace JavaScript expressions {= expression}.
const _replaceAttrs = (obj, sel, secSelObj=null, o=null, func='', shadRef=null) => {
	// Note, obj could sometimes be a string with no attributes if this is a trigger.
	// For this to be totally safe, we escape the contents of the attribute before inserting.
	if (!sel) return '';
	if (sel.indexOf('{$RAND}') !== -1) {
		let rand = Math.floor(Math.random() * 10000000);
		sel = sel.replace(/\{\$RAND\}/g, rand);
	}
	if (sel.indexOf('{=') !== -1 && !(o && ['CreateCommand', 'CreateConditional', 'Eval', 'Run'].includes(o.func))) {	// skip restoration and eval now if it needs to run dynamically.
		sel = ActiveCSS._sortOutFlowEscapeChars(sel);
		sel = _replaceJSExpression(sel);
	}
	if (sel.indexOf('{@') !== -1) {
		sel = sel.replace(/\{\@([^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let wotArr = wot.split('.'), ret, err = [];
			if (wotArr[1] && wotArr[0] == 'selected' && obj.tagName == 'SELECT') {
				// If selected is used, like [selected.value], then it gets the attribute of the selected option, rather than the select tag itself.
				ret = obj.options[obj.selectedIndex].getAttribute(wotArr[1]);
				if (ret) return _escapeItem(ret);
				ret = obj.options[obj.selectedIndex][wotArr[1]];
				if (ret) return _escapeItem(ret);
				err.push('Neither attribute or property ' + wotArr[1] + ' found in target or primary selector:');
			} else {
				let colon = wot.lastIndexOf(':');	// Get the last colon - there could be colons in the selector itself.
				if (colon !== -1) {
					// This should be an id followed by an attribute, or innerText, or it's a shadow DOM host attribute.
					let elRef = wot.substr(0, colon), el;
					if (elRef == 'host' && (!o || ['beforeShadowOpen', 'shadowOpen'].indexOf(o.event) === -1)) {
						if (!obj.shadowRoot) return '{@' + wot + '}';	// Need to leave this alone. We can't handle this yet. This can be handled in scopedVars.
						el = obj.shadowRoot;
					} else {
						el = _getSel(o, elRef);
					}
					let wat = wot.substr(colon + 1);
					if (el.tagName == 'IFRAME' && wat == 'url') {
						// If this is an iframe and the virtual attribute url is chosen, get the actual url inside the iframe.
						// We can't rely on the src of the iframe element being accurate, as it is not always updated.
						return _escapeItem(el.contentWindow.location.href);
					} else {
						ret = el.getAttribute(wat);
						if (ret) return _escapeItem(ret);
						ret = el[wat];
						if (ret) return _escapeItem(ret);
						err.push('Neither attribute or property ' + wat + ' found in target or primary selector:');
					}
				} else {
					if (obj && typeof obj !== 'string') {
						if (secSelObj) {
							// Check the target selector first.
							ret = secSelObj.getAttribute(wot);
							if (ret) return _escapeItem(ret);
							ret = secSelObj[wot];
							if (ret) return _escapeItem(ret);
						}
						// Check the primary selector next.
						ret = obj.getAttribute(wot);
						if (ret) return _escapeItem(ret);
						ret = obj[wot];
						if (ret) return _escapeItem(ret);
						err.push('Attribute not property ' + wot + ' found in target or primary selector:');
					}
				}
			}
			if (err) err.push(obj);
			return '';	// More useful to return an empty string. '{@' + wot + '>';
		});
	}
	// Replace regular scoped variables with their content, and if content-based put internal wrappers around the bound variables so they can be formatted later.
	// We can only do this after attributes have been substituted, in order to handle variable binding in an attribute that also has an attribute substituted.
	return _replaceScopedVars(sel, secSelObj, func, o, null, null, shadRef);
};
