//	Next selector in list, then cycles
ActiveCSS.nextCycle = sel => {
	return _focusOn({ actVal: sel }, 'ncc', true);
};
