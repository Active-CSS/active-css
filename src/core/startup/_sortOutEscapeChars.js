const _sortOutEscapeChars = (str) => {
	let mapObj = {
		_ACSS_brace_start: '{',
		_ACSS_brace_end: '}',
		_ACSS_escaped_quote: '\\"',
		_ACSS_semi_colon: ';',
		_ACSS_colon: ':',
		_ACSS_slash: '/',
		_ACSS_at: '@',
		_ACSS_subst_equal_brace_start: '{=',
		_ACSS_subst_equal_brace_end: '=}',
		_ACSS_subst_dollar_brace_start: '{$',
		_ACSS_subst_brace_start: '{',
		_ACSS_subst_at_brace_start: '{@',
		_ACSS_subst_pipe_brace_start: '{|',
		_ACSS_subst_hash_brace_start: '{#',
		_ACSS_subst_brace_end: '}',
		_ACSS_dot: '.',
		_ACSS_escaped_double_slash: '//',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};
