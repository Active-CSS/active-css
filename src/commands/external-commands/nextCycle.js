//	Next selector in list, then cycles
ActiveCSS.nextCycle = sel => {
	return _a.FocusOn({ actVal: sel }, 'ncc', true);
};
