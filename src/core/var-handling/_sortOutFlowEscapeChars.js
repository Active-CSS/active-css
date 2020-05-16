ActiveCSS._sortOutFlowEscapeChars = str => {
	/* These strings stay in the config as they are. They get converted:
		1. In replaceAttrs, before JavaScript expressions are evaluated.
		2. In extension monitor, before the action value is drawn on the left or the right.
		3. In extension elements, when the action value is drawn.
		4. It gets put back to the original string value when a target selector or an action value is edited.
	*/
	let mapObj = {
		'_ACSS_later_comma': ',',
		'_ACSS_later_brace_start': '{',
		'_ACSS_later_brace_end': '}',
		'_ACSS_later_semi_colon': ';',
		'_ACSS_later_colon': ':',
		'_ACSS_later_double_quote': '"',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};
