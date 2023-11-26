const _parseConfig = (str, inlineActiveID=null) => {
	// Keep the parsing regex for the config arrays as simple as practical.
	// The purpose of this script is to escape characters that may get in the way of evaluating the config sanely during _makeVirtualConfig.
	// There may be edge cases that cause this to fail, if so let us know, but it's usually pretty solid for practical use.
	// External debugging tools can be set up for line syntax checking - keep the engine at optimum speed.
	// If someone wants to thrash test it, please let support know of any exceptional cases that should pass but don't.
	// There are quite possibly unnecessary bits in the regexes. If anyone wants to rewrite any so they are more accurate, that is welcome.
	// This sequence, and the placing into the config array after this, is why the core is so quick, even on large configs. Do not do manually looping on
	// the main config. If you can't work out a regex for a new feature, let the main developers know and they'll sort it out.
	if (inlineActiveID) str = _unEscNoVars(str);

	// First up, remove everything between /* and */.
	// Handle escaped \/* and *\/ so they don't match. These are the way to output these when used in double quotes.
	str = str.replace(/\\\/\*/gm, '_ACSSOPCO');
	str = str.replace(/\*\\\//gm, '_ACSSOPCL');
	// Now wipe the rest.
	str = str.replace(/\/\*[\s\S]*?\*\//gm, '');
	// Put the escaped ones back.
	str = str.replace(/_ACSSOPCO/gm, '/*');
	str = str.replace(/_ACSSOPCL/gm, '*/');

	// Escape escaped quotes to evaluate at runtime.
	str = str.replace(/\\'/gm, '_ACSS_later_escsingle_quote');
	str = str.replace(/\\"/gm, '_ACSS_later_escdouble_quote');

	// Convert the single quotes into double-quotes where applicable and do the necessary escaping.
	// https://regex101.com/?regex=%28%5B%5C%27%22%5D%29%28%28%5C%5C%5C1%7C.%29%2A%3F%29%5C1&options=gm&text=defined+%28+%27WP_DEBUG%27+%29+||+define%28+%27%5CWP_DEBUG%27%2C+true+%29%3B%0Aecho+%27class%3D%22input-text+card-number%22+type%3D%22text%22+maxlength%3D%2220%22%27%3B%0Aecho+%27How+are+you%3F+I%5C%27m+fine%2C+thank+you%27%3B
	str = str.replace(/(['"])((\\\1|.)*?)\1/gm, function(_, quot, innards) {
		innards = innards.replace(/\/\//g, '_ACSS_escaped_double_slash');
		if (quot == '"') {
			innards = innards.replace(/\\"/g, '_ACSS_escaped_quote');
		} else {
			innards = innards.replace(/\\'/gm, '_ACSS_sing_quote');
			innards = innards.replace(/"/g, '_ACSS_escaped_quote');
		}
		return '"' + innards + '"';
	});
	str = str.replace(/_ACSS_sing_quote/g, "'");

	// Remove line-breaks, etc., so we remove any multi-line weirdness in parsing. Maintain HTML display integrity in components when faced with a line break.
	str = str.replace(/[\r\n]+/g, ' ');

	// Convert @command into a friendly-to-parse body:init event. Otherwise it gets unnecessarily messy to handle later on due to being JS and not CSS.
	let systemInitConfig = '';
	str = str.replace(/@command[\s]+(conditional[\s]+)?([\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+[\s]*\{\=[\s\S]*?\=\})/g, function(_, typ, innards) {
		// Take these out of whereever they are and put them at the bottom of the config after this action. If typ is undefined it's not a conditional.
		systemInitConfig += _addToSystemInit(inlineActiveID, (!typ ? 'create-command' : 'create-conditional'), innards);
		return '';
	});
	str += systemInitConfig;

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

	// Handle continue; and break;, etc. so they parse later on. This can be optimised, and also made to work with whitespace before the semi-colon as it doesn't here.
	// Put these into a general non-colon command array.
	str = str.replace(INQUOTES, function(_, innards) {
		innards = innards.replace(/continue\;/g, '_ACSS_continue');
		innards = innards.replace(/break\;/g, '_ACSS_break');
		innards = innards.replace(/exit\;/g, '_ACSS_exit');
		innards = innards.replace(/exit\-target\;/g, '_ACSS_exittarg');
		innards = innards.replace(/&\:connectedCallback\;/g, '_ACSS_connCall');
		return innards;
	});
	str = str.replace(INSINGQUOTES, function(_, innards) {
		innards = innards.replace(/continue\;/g, '_ACSS_continue');
		innards = innards.replace(/break\;/g, '_ACSS_break');
		innards = innards.replace(/exit\;/g, '_ACSS_exit');
		innards = innards.replace(/exit\-target\;/g, '_ACSS_exittarg');
		innards = innards.replace(/&\:connectedCallback\;/g, '_ACSS_connCall');
		return innards;
	});
	str = str.replace(/([\s\;\{])continue\;/g, '$1continue:1;');
	str = str.replace(/([\s\;\{])break\;/g, '$1break:1;');
	str = str.replace(/([\s\;\{])exit\;/g, '$1exit:1;');
	str = str.replace(/([\s\;\{])exit\-target\;/g, '$1exit\-target:1;');
	str = str.replace(/&\:connectedCallback/g, '&:beforeComponentOpen');
		
	str = str.replace(/_ACSS_continue/g, 'continue;');
	str = str.replace(/_ACSS_break/g, 'break;');
	str = str.replace(/_ACSS_exit/g, 'exit;');
	str = str.replace(/_ACSS_exittarg/g, 'exit-target;');
	str = str.replace(/_ACSS_connCall/g, '&:connectedCallback');

	// Handle any embedded Active CSS style tags and convert to regular style tags.
	str = str.replace(/acss\-style/gi, 'style');
	// Escape all style tag innards. This could contain anything, including JS and other html tags. Straight style tags are allowed in file-based config.
	str = str.replace(/<style>([\s\S]*?)<\/style>/gi, function(_, innards) {
		return '<style>' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + '</style>';
	});

	// First, replace all escaped curlies with something else.
	str = str.replace(/\\{/g, '_ACSS_later_escbrace_start');
	str = str.replace(/\\}/g, '_ACSS_later_escbrace_end');

	// Replace all inner HTML component events with something else.
	if (str.indexOf('{:') !== -1 && str.indexOf(':}') !== -1) {
		// Extract all content between {: and :} and replace with a placeholder for any rendering that may happen when the component is rendered.
		str = _extractCompInnerHTMLEvs(str);
	}

	// Replace variable substitutations, ie. {$myVariableName}, etc.
	str = str.replace(/\{\{\$([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\"\[\] \.\$\|\@]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start_ACSS_subst_dollar_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\$([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\"\[\] \.\$\|\@]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_dollar_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\" \.\[\]]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\{\$\|\#\:]+)\}\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_brace_start_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\@([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\{\$\|\#\:]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_at_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\|([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\'\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_pipe_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{\#([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.\:\{\$\|\@\}]+)\}/gi, function(_, innards) {
		innards = innards.replace(/\./g, '_ACSS_dot');
		return '_ACSS_subst_hash_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\"\. \$\[\]\(\)]+)\}/gi, function(_, innards) {
		if (innards.trim() == '') return '{}';
		innards = innards.replace(/\./g, '_ACSS_dot');	// for speed rather than using a map.
		return '_ACSS_subst_brace_start' + innards + '_ACSS_subst_brace_end';
	});
	// Sort out component escaping.

	// Now we can match the component accurately. The regex below should match all components.
	str = str.replace(/([^\u00BF-\u1FFF\u2C00-\uD7FF\w\-]html[\s]*{)([\s\S]*?)}/gi, function(_, startBit, innards) {
		// Replace existing escaped quote placeholder with literally escaped quotes.
		innards = innards.replace(/_ACSS_escaped_quote/g, '\\"');
		// Now escape all the quotes - we want them all escaped, and they wouldn't have been picked up before.
		innards = innards.replace(/"/g, '_ACSS_escaped_quote');
		// Escape all tabs, as after this we're going to remove all tabs from everywhere else in the config and change to spaces, but not in here.
		innards = innards.replace(/\t/g, '_ACSS_tab');
		// Now format the contents of the component so that it will be found when we do a css-type object creation later.
		let retStr = startBit + '{component: "' + innards + '";}';
		if (innards.indexOf('__acssInnerHTMLEv_') !== -1) {
			// Now add any inner events for this HTML block, and place them after the current retStr so they are inside the component when it is set up.
			retStr = _attachCompInnerHTMLEvs(retStr);
		}
		return retStr;
	});

	// Put the component event characters back in as they were.
	str = str.replace(/_ACSS_comp_evbrace_start/g, '{:');
	str = str.replace(/_ACSS_comp_evbrace_end/g, ':}');

	// Convert tabs to spaces in the config so that multi-line breaks will work as expected.
	str = str.replace(/\t+/g, ' ');
	// Unconvert spaces in component html back to tabs so that HTML can render as per HTML rules.
	str = str.replace(/_ACSS_tab/g, '\t');

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
		'@': '_ACSS_at',
	};

	str = str.replace(INQUOTES, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});

	// Convert @conditional into ?, so we don't have to bother with handling that in the parser.
	str = str.replace(/@conditional[\s]+/g, '?');

	// Do a similar thing for parentheses. Handles pars({#formID}&mypar=y) syntax.
	str = str.replace(/([\(]([^\(\)]|\(\))*[\)])/g, function(_, innards) {
		return ActiveCSS._mapRegexReturn(mapObj, innards);
	});

	// Sort out var action command syntax, as that could be pretty much anything. This might need tweaking.
	str = str.replace(/[\s]*[^\S]var[\s]*\:([\s\S]*?)\;/gim, function(_, innards) {
		return 'var: ' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + ';';
	});

	str = str.replace(/[\s]*(\$[\u00BF-\u1FFF\u2C00-\uD7FF\w\-\'\"\[\] \.\$\|\@]+)[\s]*\:([\s\S]*?)\;/gim, function(_, varname, innards) {
		return varname + ': ' + ActiveCSS._mapRegexReturn(DYNAMICCHARS, innards) + ';';
	});

	// Infinite loop failsafe variable. Without this, unbalanced curlies may call an infinite loop later.
	let totOpenCurlies = str.split('{').length;

	// Now run the actual parser now that we have sane content.
	let obj = _convConfig(str, totOpenCurlies, 0, inlineActiveID);
	if (!Object.keys(obj).length) {
		_err('There is a structural syntax error at initial parsing stage. Config that failed to parse: ' + str);
	}

	return obj;
};
