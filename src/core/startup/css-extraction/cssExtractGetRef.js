const cssExtractGetRef = (fileRef) => {
	// If fileRef is empty, it's definitely come from loaded config and not embedded - it's optional - for speed.
	// Return the extracted CSS stylesheet reference. This will be placed into the data-css-ref attribute when the stylesheet gets inserted onto the page.
	// It's done like this and not via any other internal method is so that the CSS can be tweaked using DevTools.
	// If fileRef.startsWith('_inline_'):
		// This is a CSS extraction from an embedded ACSS style tag. One stylesheet is generated per tag so it can be removed if necessary.
		// It will look like '_acss_css_inline_nnn' (where "nnn" is a number).
	// otherwise:
		// This is a CSS extraction from loaded config. Loaded config CSS gets accumulatively appended to a single stylesheet in the order it is loaded.
		// 
	
	if (fileRef && fileRef.startsWith('_inline_')) {
		return fileRef;
	} else {
		return 'permanent';
	}
};
