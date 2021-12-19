//const _getSel = (o, sel, priorToGrabAll, many=false) => {
const _getSel = (o, sel, many=false) => {
	let item = false;

// This switch statement needs to be put into the _splitIframeEls loop.
// Get the '<' and '&' selectors in there too, which is currently in _prepSelector.

// Consider the potential for double-evaluation if you consider variable substitution as part of this evolution.

	switch (sel) {
		case 'me':
		case 'self':
		case 'this':
			item = o.secSelObj;
			if (item && many) item = [ item ];
			break;
		case 'host':
			if (['beforeComponentOpen', 'componentOpen'].indexOf(o.event) !== -1) {
				// The host is already being used as the target selector with these events.
				item = o.secSelObj;
			} else {
				let rootNode = _getRootNode(o.secSelObj);
				item = (rootNode._acssScoped) ? rootNode : rootNode.host;
			}
			if (item && many) item = [ item ];
			break;
		default:
			// Set priorToGrabAll to return true to handle result sets in the calling function.
			// See _a.Remove for an example of handling a result set - it depends on the context, so the action is done in there.
			// If this happens a lot, use a callback function and pass in arguments - it's not worth the complexity this brings right now though.
			// Grab the element or the first in the group specified.
			let targArr = _splitIframeEls(sel, o);
			if (!targArr) return false;	// invalid target.
			try {
				let obj = (many) ? targArr[0].querySelectorAll(targArr[1]) : targArr[0].querySelector(targArr[1]);
				item = obj;
			} catch(err) {
				// no need to do anything more.
			}
	}
	if (item) {
		return item;
	} else {
		return false;
	}
};
