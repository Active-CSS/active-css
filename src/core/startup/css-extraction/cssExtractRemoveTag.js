const cssExtractRemoveTag = tagRef => {
	// This is only used for removing CSS extracted from embedded ACSS style tags.
	let cssTag = document.querySelector('style[data-from-acss="' + tagRef + '"]');
	if (cssTag) cssTag.parentNode.removeChild(cssTag);
};
