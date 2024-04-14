const _replaceCSSStyle = (sel, secSelObj) => {
	// Replace {:...} with inline style or {::...} with getComputedStyle.
	if (sel.indexOf('{:') !== -1 && secSelObj) {
		sel = sel.replace(/\{\:(\:?[^\t\n\f \/>"'=(?!\{)]+)\}/gi, function(_, wot) {
			let getRealProperty = false;
			if (wot.startsWith(':')) {
				getRealProperty = true;
				wot = wot.substr(1);
			}
			let res;
			let camelProp = _hypenToCamel(wot);
			if (getRealProperty) {
				// Get the computed style.
				let styl = getComputedStyle(secSelObj);
				res = styl[camelProp];
			} else {
				// Get the inline style.
				res = secSelObj.style[camelProp];
			}
			return res || '';
		});
	}

	return sel;
};
