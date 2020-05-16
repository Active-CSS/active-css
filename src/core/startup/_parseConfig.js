const _parseConfig = str => {
	// Keep the parsing regex for the config arrays as simple as practical.
	// External debugging tools can be set up for line syntax checking - keep the engine at optimum speed.
	// If someone wants to thrash test it, please let support know of any exceptional cases that should pass but don't. It's quite solid in practice.
	// There are quite possibly unnecessary bits in the regexes. If anyone wants to rewrite any so they are more accurate, that is welcome.
	// This sequence, and the placing into the config array after this, is why the core is so quick, even on large configs. Do not do manually looping on
	// the main config. If you can't work out a regex for a new feature, let the main developers know and they'll sort it out.
	// Remove all comments.
	str = str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
	// Remove line-breaks, etc., so we remove any multi-line weirdness in parsing.
	str = str.replace(/[\r\n\t]+/g, '');
	// Replace escaped quotes with something else for now, as they are going to complicate things.
	str = str.replace(/\\\"/g, '_ACSS_escaped_quote');
	// Sort out raw JavaScript in the config so it doesn't clash with the rest of the config. The raw javascript needs to get put back to normal at evaluation time,
	// and not before, otherwise things go weird with the extensions.
	// With the extensions, there is a similar routine to put these escaped characters back in after a modification from there - it's not the same thing though,
	// as this handles the whole config, not just a particular part of it, so it is necessarily a separate thing (_escapeCharsForConfig.js).
	str = str.replace(/\{\=([\s\S]*?)\=\}/g, function(_, innards) {
		if (innards.indexOf('*debugfile:') !== -1) {	// It's not there for a JavaScript expression (eg "new Date()").
			// We only want the last debugfile string (file, line data) if it is there - remove the last "*" so it fails the next regex.
			innards = innards.trim().slice(0, -1);
			// Get rid of full debugfile entries, which always end in a "*".
			innards = innards.replace(/\*debugfile\:[\s\S]*?\*/g, '');	// get rid of any other debug line numbers - they just get in the way and we don't need them.
			// Put the last "*" back so there is only the last debugline string in there.
			innards += '*';
		}
		return '_ACSS_subst_equal_brace_start' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '_ACSS_subst_equal_brace_end';
	});
	str = str.replace(/<style>([\s\S]*?)<\/style>/gim, function(_, innards) {
		return '<style>' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '</style>';
	});
	// Sort out var action command syntax, as that could be pretty much anything. This might need tweaking.
	str = str.replace(/[\s]*var[\s]*\:([\s\S]*?)\;/gim, function(_, innards) {
		return 'var: ' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + ';';
	});
	// Replace variable substitutations, ie. ${myVariableName}, etc.
	str = str.replace(/\{\$([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_dollar_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\[\]]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\#\:]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_brace_start_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\#\:]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_pipe_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_hash_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\[\]]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	// Sort out component escaping.
	// First, replace all escaped curlies with something else.
	str = str.replace(/\\{/g, '_ACSS_brace_start');
	str = str.replace(/\\}/g, '_ACSS_brace_end');
	// Now we can match the component accurately. The regex below should match all components.
	str = str.replace(/([^\u00BF-\u1FFF\u2C00-\uD7FF\w_\-]html[\u00BF-\u1FFF\u2C00-\uD7FF\w_\- ]+{)([\s\S]*?)}/gi, function(_, startBit, innards) {
		// Replace existing escaped quote placeholder with literally escaped quotes.
		innards = innards.replace(/_ACSS_escaped_quote/g, '\\"');
		// Now escape all the quotes - we want them all escaped, and they wouldn't have been picked up before.
		innards = innards.replace(/"/g, '_ACSS_escaped_quote');
		// Now format the contents of the component so that it will be found when we do a css-type object creation later.
		return startBit + '{component: "' + innards + '";}';
	});
	// Now we have valid quotes, etc., we want to replace all the key characters we are using in the cjs config within
	// quotes with something else, to be put back later. This is so we can keep the parsing simple when we generate the
	// tree structure. We need to escape all the key characters that the json parser uses to work out the structure.
	// We will put all the valid characters back when we are setting up the json objects after it has passed "css" validation.
	let mapObj = {
		'{': '_ACSS_brace_start',
		'}': '_ACSS_brace_end',
		';': '_ACSS_semi_colon',
		':': '_ACSS_colon',
		'/': '_ACSS_slash',
	};
	str = str.replace(/("([^"]|"")*")/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});
	// Do a similar thing for parentheses. Handles pars({#formID}&mypar=y) syntax.
	str = str.replace(/([\(]([^\(\)]|\(\))*[\)])/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});

	// Infinite loop failsafe variable. Without this, unbalanced curlies may call an infinite loop later.
	let totOpenCurlies = str.split('{').length;

	// Now run the actual parser now that we have sane content.
	str = _convConfig(str, totOpenCurlies);
	if (!str['0']) {
		console.log('Active CSS: Either your config is empty or there is a structural syntax error.');
	}
	return str;
};
