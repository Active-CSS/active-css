const _addCSSToBody = (css, tagRef, toBody) => {
	// Adds to a body based on the ref, otherwise adds to the existing style tag.
	let tagIfThere = document.querySelector('style[data-from-acss="' + tagRef + '"]');		// Note: tagRef is a predictable string - so this is fine.
	if (tagIfThere) {
		// Append to existing style tag.
		tagIfThere.cssText = tagIfThere.cssText + css;
	} else {
		// Create new tag.
		let tag = document.createElement('style');
		tag.type = 'text/css';
		tag.setAttribute('data-from-acss', tagRef);
		tag.appendChild(document.createTextNode(css));
		// Append to the bottom of the headers.
		document.head.append(tag);
	}
};
