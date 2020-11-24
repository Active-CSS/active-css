const _escapeInline = (str, start) => {
	// Escape all single opening curlies so that the parser will not substitute any variables into the inline Active CSS or JS.
	// This runs immediately on an ajax return string for use by {$STRING} and the result is stored, so it is only ever run once for speed.
	// This gets unescaped prior to insertion into the DOM.
	let end = start.split(' ')[0];
	let reg = new RegExp('<' + start + '([\\s\\S]*?)>([\\s\\S]*?)</' + end + '>', 'gi');
	str = str.replace(reg, function(_, inn, inn2) {
		return '<' + start + inn + '>' + inn2.replace(/\{/g, '_ACSS_later_brace_start') + '</' + end + '>';
	});
	return str;
};
