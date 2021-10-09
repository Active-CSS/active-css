const _getSel = (o, sel, priorToGrabAll) => {
	switch (sel) {
		case 'me':
		case 'self':
		case 'this':
			return o.secSelObj;
		case 'host':
			if (['beforeComponentOpen', 'componentOpen'].indexOf(o.event) !== -1) {
				// The host is already being used as the target selector with these events.
				return o.secSelObj;
			}
			let rootNode = _getRootNode(o.secSelObj);
			return (rootNode._acssScoped) ? rootNode : rootNode.host;
		default:
			// Set priorToGrabAll to return true to handle result sets in the calling function.
			// See _a.Remove for an example of handling a result set - it depends on the context, so the action is done in there.
			// If this happens a lot, use a callback function and pass in arguments - it's not worth the complexity this brings right now though.
			// Grab the element or the first in the group specified.
			return (priorToGrabAll !== true) ? _getObj(sel, o) : false;
	}
};
