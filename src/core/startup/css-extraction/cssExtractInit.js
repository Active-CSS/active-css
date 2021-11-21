const _cssExtractInit = (fileRef) => {
	let tagRef = _cssExtractGetRef(fileRef);
	if (tagRef != 'permanent' && extractedCSS[tagRef] !== undefined) {
		_err('Internal reference for CSS extraction (' + tagRef + ') already exists.', null, 'extractedCSS[tagRef]:', extractedCSS[tagRef]);
	}
	extractedCSS[tagRef] = '';
};
