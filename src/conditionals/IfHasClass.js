_c.IfHasClass = o => {
	let arr = _actValSelItem(o);
	return (arr[0] && ActiveCSS._hasClassObj(arr[0], arr[1].substr(1)));		// Used by extensions.
};
