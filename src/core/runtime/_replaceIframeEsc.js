const _replaceIframeEsc = str => {
	return str.replace(/_ACSS_lt/gm, '<').replace(/_ACSS_gt/gm, '>');
};
