const _setHashEvent = thisHashStr => {
	if (thisHashStr != '') {
		// Get the hash trigger if there is one.
		let hashSplit = thisHashStr.split('#');
		let hashSplitLen = hashSplit.length;
		let n;
		for (n = 0; n < hashSplitLen; n++) {
			if (hashSplit[n] == '') continue;
			// Store the hash for when the page has loaded. It could be an embedded reference so we can only get the event once the page has loaded.
			hashEvents.push(hashSplit[n]);
			hashEventTrigger = true;
		}
	}
};
