// This function must only be called when inserting textContent into elements - never any other time. All variables get escaped so no HTML tags are allowed.
const _replaceScopedVarsDo = (str, obj=null, func='', o=null, walker=false, shadHost=null, varScope=null, varReplacementRef=-1, noHTMLEscape=false) => {
	let res, cid, isBound = false, isAttribute = false, isHost = false, originalStr = str;

	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{((\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w\$\' \"\-\.\:\[\]]+(\})?)\}/gm, function(_, wot) {
			if (wot.startsWith('$') || wot.indexOf('.$') !== -1) return '{' + wot + '}';
			let realWot;
			if (wot[0] == '{') {		// wot is a string. Double curly in pre-regex string signifies a variable that is bound to be bound.
				isBound = true;
				// Remove the outer parentheses now that we know this needs binding.
				wot = wot.slice(1,-1);
			}
			let origVar = wot;	// We don't want the outer curlies - just the variable name before scoping.
			if (wot[0] == '@') {
				// This is an attribute not handled earlier. It's hopefully a shadow DOM host attribute as regular bound attribute vars are not yet supported.
				if (!shadHost) return _;	// Shouldn't handle this yet. Only handle it when called from _renderCompDoms.
				isAttribute = true;
				wot = wot.slice(1);
				let hostColon = 'host:';
				if (wot.indexOf(hostColon) !== -1) {
					isHost = true;
					wot = wot.replace(hostColon, '');
					res = (shadHost.hasAttribute(wot)) ? (noHTMLEscape || func == 'SetAttribute') ? shadHost.getAttribute(wot) : _escapeItem(shadHost.getAttribute(wot)) : '';
					let hostCID = _getActiveID(shadHost).replace('d-', '');
					realWot = hostCID + 'HOST' + wot;	// Store the host active ID so we know that it needs updating inside a shadow DOM host.
				} else {
					_warn('Non component attribution substitution is not yet supported', o);
					return _;
				}
			} else {
				let scoped = _getScopedVar(wot, varScope);
				res = scoped.val;

				// Return an empty string if undefined.
				res = (res === true) ? 'true' : (res === false) ? 'false' : (res === null) ? 'null' : (typeof res === 'string') ? ((noHTMLEscape || func == 'SetAttribute') ? res : _escapeItem(res, origVar)) : (typeof res === 'number') ? res.toString() : (res && typeof res === 'object') ? '__object' : '';	// remember typeof null is an "object".
				realWot = scoped.name;
			}
			if (isBound && (func == 'asRender' || func.indexOf('Render') !== -1)) {
				// We only need comment nodes in content output via render - ie. visible stuff. Any other substitution is dynamically rendered from
				// original, untouched config.
				_addScopedCID(realWot, obj, varScope);
				let retLT, retGT;
				if (obj.tagName == 'STYLE') {
					retLT = (walker) ? '_cj_s_lts_' : '/*';
					retGT = (walker) ? '_cj_s_gts_' : '*/';
				} else {
					retLT = (walker) ? '_cj_s_lt_' : '<!--';
					retGT = (walker) ? '_cj_s_gt_' : '-->';
				}
				let placeHolder = _varChangeToDots(realWot);
				return retLT + 'active-var-' + placeHolder + retGT + res + retLT + '/active-var' + retGT;
			} else {
				// If this is an attribute, store more data needed to retrieve the attribute later.
				if (func == 'SetAttribute') {
					// Inner brackets vars get resolved into the original string so that we get reactivity happening correctly in loops, etc.
					_addScopedAttr(realWot, o, _resolveInnerBracketVars(originalStr, varScope), walker, varScope);
				}
				// Send the regular scoped variable back.
				return _preReplaceVar(res, varReplacementRef);
			}
		});
	}

	return str;
};
