// This function must only be called when inserting textContent into elements - never any other time. All variables get escaped so no HTML tags are allowed.
const _replaceScopedVarsDo = (str, obj=null, func='', o=null, walker=false, shadHost=null, varScope=null) => {
	let res, cid, isBound = false, isAttribute = false, isHost = false, originalStr = str;

	if (str.indexOf('{') !== -1) {
		str = str.replace(/\{((\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w_\$\'\"\-\.\:\[\]]+(\})?)\}/gm, function(_, wot) {
			if (wot.startsWith('$')) return '{' + wot + '}';
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
					if (shadHost.hasAttribute(wot)) {
						res = _escapeItem(shadHost.getAttribute(wot));
						let hostCID = _getActiveID(shadHost).replace('d-', '');
						realWot = hostCID + 'HOST' + wot;	// Store the host active ID so we know that it needs updating inside a shadow DOM host.
					} else {
						return '';
					}
				} else {
					console.log('Non component attribution substitution is not yet supported.');
					return _;
				}
			} else {
				// Convert to dot format to make things simpler in the core - it is faster to update if there is only one type of var to look for.
				wot = wot.replace(/\[[\'\"]?/g, '.').replace(/[\'\"]?\]/g, '');
				// Evaluate the JavaScript expression.
				if (wot.indexOf('.') !== -1) {
					// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
					// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
					let firstVar = wot.split('.')[0];
					// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use "scopedVars", but do a handling for that anyway.
					if (firstVar == 'window') return wot;
					if (firstVar == 'scopedVars') {
						wot = wot.replace(/^scopedVars\./, '');
					}
				}
				// Prefix with sub-scope (main or _VarScope).
				wot = (varScope && privVarScopes[varScope]) ? varScope + '.' + wot : 'main.' + wot;
				wot = _resolveInnerBracketVars(wot);
				let scopedVarObj = _resolveInheritance(wot);
				res = scopedVarObj.val;
				// Return an empty string if undefined.
				res = (res === true) ? 'true' : (res === false) ? 'false' : (res === null) ? 'null' : (typeof res === 'string') ? _escapeItem(res, origVar) : (typeof res === 'number') ? res.toString() : (res && typeof res === 'object') ? '__object' : '';	// remember typeof null is an "object".
				realWot = wot;
			}
			if (isBound && func.indexOf('Render') !== -1) {
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
				return retLT + 'active-var-' + realWot + retGT + res + retLT + '/active-var' + retGT;
			} else {
				// If this is an attribute, store more data needed to retrieve the attribute later.
				if (func == 'SetAttribute') {
					_addScopedAttr(realWot, o, originalStr, walker, varScope);
				}
				// Send the regular scoped variable back.
				return res;
			}
		});
	}
	return str;
};
