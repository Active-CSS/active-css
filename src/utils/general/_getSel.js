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
			// Grab the element or the first in the group specified.
			return (priorToGrabAll !== true) ? _getObj(sel, o) : false;
	}
};
