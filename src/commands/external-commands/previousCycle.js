//	Previous selector in list, then cycles
ActiveCSS.previousCycle = sel => {
	return _a.FocusOn({ actVal: sel }, 'pcc', true);
};
