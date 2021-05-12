// Not the same as the lodash one, but similar.
const _escForRegex = str => {
	return str.replace(REGEXCHARS, '\\$&');
};
