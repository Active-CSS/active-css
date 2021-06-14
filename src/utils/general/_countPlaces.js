const _countPlaces = num => {
	// Counts the number of decimal places and returns it.
    let str = num.toString();
    let pos = str.indexOf('.');
    return (pos == -1) ? 0 : (str.length - pos - 1);
};
