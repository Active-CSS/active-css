const _addConfig = (str, o) => {
	// Concatenate the config files before processing.
	// Before we add the config, we want to add line numbers for debug.
	let configLineArr = str.match(/^.*((\r\n|\n|\r)|$)/gm);
	let newStr = '';
	for (let n = 0; n < configLineArr.length; n++) {
		newStr += '*debugfile:' + o.file + ':' + (n + 1) + '*' + configLineArr[n];
	}
	str = newStr;
	concatConfig += str;
	concatConfigCo++;

	// If this is last file, run the config generator.
	if (concatConfigCo >= concatConfigLen) _readSiteMap();

	if (concatConfigCo > concatConfigLen) {
		if (o.actName == 'load-config') {
			configArr.push(o.avRaw);	// Add the file without anything after and including the "?".
			// Handle updating the extensions. Either or not of them could be showing, so they either get an immediate update, or a flag is set for them to
			// update if they received the onShown event. Similar to the config update to the Panel whenever an element is edited in Elements.
			// It's slightly different in that we need the additional optional step of the immediate update instead of the onShown triggered update, plus
			// we need to update both Elements and Panel here, and not only the Panel as in the case of the edited element in Elements.
			if (setupEnded) {
				// Send a message to the extensions to update the config display. This goes to both extensions.
				if (debuggerActive) {
					_tellPanelToUpdate();
				}
				if (evEditorActive) {
					_tellElementsToUpdate();
				}
			}
		}
		_handleEvents({ obj: '~_acssSystem', evType: 'afterLoadConfig' });
		_handleEvents({ obj: 'body', evType: 'afterLoadConfig' });
		_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	}
};
