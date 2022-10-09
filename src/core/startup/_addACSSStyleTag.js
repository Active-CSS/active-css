const _addACSSStyleTag = (acssTag) => {
	let activeID = _getActiveID(acssTag);
	inlineIDArr.push(activeID);
	concatConfigLen++;
	_addConfig(acssTag.innerHTML, { file: '_inline_' + activeID, inlineActiveID: activeID });

	// If prod version, wipe embedded config from page (code can be viewed from source in the prod edition, but will not be seen with DevTools).
	// The tag needs to stay on the page so that the core can detect tag removal and adjust loaded config in memory.
	// Embedded config cannot be adjusted maliciously via DevTools in the prod version of the core, so this action is a courtesy and a reduction of unnecessary
	// text nodes on the page.
	// Mark the tag as loaded with an attribute so it is obvious where the tag came from when inspecting.
	if (!DEVCORE) {
		acssTag.innerHTML = '';
		acssTag.setAttribute('data-embedded-acss-loaded', true);
	}
	return activeID;
};