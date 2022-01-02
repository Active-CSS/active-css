const _cssExtractAddTags = fileRef => {
	// fileRef will be populated if embedded or empty if from loaded config.
	let tagRef = _cssExtractGetRef(fileRef);

	// No need to do anything if there isn't any CSS for extraction from the ACSS config.
	if (extractedCSS[tagRef] !== undefined && extractedCSS[tagRef] !== '') {
		// Add CSS to the end of the body. If the tag is already there, in the case of "permanent" loaded config, it will add it to the existing tag.
		_addCSSToBody(extractedCSS[tagRef], tagRef);
	}
	// Delete the CSS from memory now that it is added to the DOM. There's no reason it needs to stick around and we don't want to add it more than once.
	// The embedded CSS style tag that has been created here will get cleaned up in _regenConfig if it came from a removed embedded ACSS tag.
	delete extractedCSS[tagRef];

	// If there are any CSS tags left to output, do that. These will be from embedded ACSS tags if anything is run here.
	let i;
	for (i in extractedCSS) {
		// Put at the bottom of the headers. Extracted CSS tags in an SPA will always be placed into the DOM before the new inner content is drawn
		// and it keeps the body content cleaner.
		if (extractedCSS[i] !== undefined && extractedCSS[i] !== '') {
			_addCSSToBody(extractedCSS[i], i);
		}
		delete extractedCSS[i];
	}
};
