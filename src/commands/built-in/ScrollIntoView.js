_a.ScrollIntoView = o => {
	if (!_isConnected(o.secSelObj)) return false;
	/* Parameters
	true = block-start block-nearest
	false = block-end block-nearest

	behaviour-auto = { behaviour: 'auto' }
	behaviour-smooth = { behaviour: 'smooth' }
	block-start = { block: 'start' }
	block-center = { block: 'center' }
	block-end = { block: 'end' }
	block-nearest = { block: 'nearest' }
	inline-start = { inline: 'start' }
	inline-center = { inline: 'center' }
	inline-end = { inline: 'end' }
	inline-nearest = { inline: 'nearest' }
	*/
	let arr = o.actVal.split(' ');
	let bl = 'start', inl = 'nearest';
	let behave = _optDef(arr, 'behaviour-smooth', 'smooth', 'auto');
	if (o.actVal == 'true') {
		// Options are already set.
	} else if (o.actVal == 'false') {
		bl = 'end';
	}
	bl = _optDef(arr, 'block-center', 'center', bl);	// center not supported in Firefox 48.
	bl = _optDef(arr, 'block-end', 'end', bl);
	bl = _optDef(arr, 'block-nearest', 'nearest', bl);
	inl = _optDef(arr, 'inline-center', 'center', inl);
	inl = _optDef(arr, 'inline-end', 'end', inl);
	inl = _optDef(arr, 'inline-nearest', 'nearest', inl);

	try {	// Causes error in Firefox 48 which doesn't support block center, so fallback to default for block on failure.
		o.secSelObj.scrollIntoView({ behaviour: behave, block: bl, inline: inl });
	} catch (err) {
		o.secSelObj.scrollIntoView({ behaviour: behave, inline: inl });
	}
};
