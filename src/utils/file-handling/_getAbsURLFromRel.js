const _getAbsURLFromRel = (url, o) => {
	let rootPathFile;
	if (o.renderComp) {
		rootPathFile = components[o.renderObj.compName].file;
	} else if (o.file) {
		rootPathFile = o.file;
	} else {
		rootPathFile = window.location.href;
	}
	let newURL = url.trim();
	let dotDotSlash = (newURL.indexOf('../') !== -1);
	let notRel = (newURL.startsWith('/') || newURL.indexOf('://') !== -1);
	if (notRel) {
		if (dotDotSlash) {
			// ../ is being used incorrectly.
			_err('"../" can only be used at the beginning of a URL.', o, url);
		}
		return url;
	}
	let lastRootSlash = rootPathFile.lastIndexOf('/');
	let originalRootPath = rootPathFile.substr(0, lastRootSlash + 1);
	let rootPath = originalRootPath;
	if (dotDotSlash) {
		// This is using ../
		let urlSplit = newURL.split('../');
		let subPath, done = false;
		for (subPath of urlSplit) {
			if (done) {
				// Not allowed ../ after the initial set of ../.
				_err('"../" can only be used at the beginning of a URL.', o, url);
			}
			if (subPath == '') {
				// This was a ../
				if (rootPath == '') {
					// Reach the beginning and it's trying to get back further - show an error.
					_err('Too many "../" for relative url. The root path being used is ' + originalRootPath + '.', o, url);
				}
				rootPath = rootPath.substr(0, rootPath.slice(0, -1).lastIndexOf('/') + 1);
				continue;
			}
			newURL = rootPath + subPath;
			done = true;
		}
	} else {
		newURL = originalRootPath + newURL;
	}
	return newURL;
};
