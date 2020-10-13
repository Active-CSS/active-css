const _prepSelector = (sel, obj, doc) => {
	// This is currently only being used for target selectors, as action command use of "&" needs more nailing down before implementing - see roadmap.
	// Returns a collection of unique objects for iterating as target selectors.
	let attrActiveID;
	if (sel.indexOf('&') !== -1) {
		// Handle any "&" in the selector.
		// Eg. "& div" becomes "[data-activeid=25] div".
		if (sel.substr(0, 1) == '&') {
			// Substitute the active ID into the selector.
			attrActiveID = _getActiveID(obj);
			// Add the data-activeid attribute so we can search with it. We're going to remove it after. This keeps things simple and quicker than manual traversal.
			obj.setAttribute('data-activeid', attrActiveID);
			sel = sel.replace(/&/g, '[data-activeid=' + attrActiveID + ']');
		}
	}
	if (sel.indexOf('<') === -1) {
		let res = doc.querySelectorAll(sel);
		if (attrActiveID) obj.removeAttribute('data-activeid', attrActiveID);
		return res;
	}
	// Handle "<" selection by iterating in stages. There could be multiple instances of "<".
	let stages = sel.split('<');
	// Get first item of the array, remove it, then get selector before the "<".
	let thisEls = doc.querySelectorAll(stages.shift());
	// thisEls can contain more than one element. In which case we need to run the rest of the closest algorithm on each obj and return the collection.
	// The returned collection will only contain a unique set of objects, so objects will not appear twice in the collection.
	// Means we can do stuff like this:
	// strong < p to get all unique p tags that contain any number of strong tags.
	// It should be noted in the docs that this may have a performance impact if there are a lot of items before the first "<".
	// It is pretty fast though.
	let nextSel, objArr = new Set(), thisEl, parentEl;
	thisEls.forEach((obj) => {
		thisEl = obj;
		for (nextSel of stages) {
			// Get closest nextSel to the current element, but we want to start from the parent. Note that this will always only bring back one node.
			thisEl = thisEl.parentElement;
			if (!thisEl) break;
			thisEl = thisEl.closest(nextSel);
			if (!thisEl) break;
			// If it gets this far and there is another "<", it will take the next closest nextSel up the tree and continue looping.
		}
		if (thisEl) objArr.add(thisEl);
	});
	if (attrActiveID) obj.removeAttribute('data-activeid', attrActiveID);
	return objArr;
};
