const _getSel = (o, sel) => {
	switch (sel) {
		case 'me':
		case 'self':
		case 'this':
			return o.secSelObj;
		case 'host':
			if (['beforeShadowOpen', 'shadowOpen'].indexOf(o.event) !== -1) {
				// The host is already being used as the target selector with these events.
				return o.secSelObj;
			}
			return o.secSelObj.getRootNode().host;
		default:
			// Grab the element or the first in the group specified.
			return _getObj(sel);
	}
};
