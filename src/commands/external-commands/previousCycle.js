//	Previous selector in list, then cycles
ActiveCSS.previousCycle = sel => {
	return _focusOn({ actVal: sel }, 'pcc', true);
};
