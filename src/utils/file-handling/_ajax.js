const _ajax = (getMethod, fileType, filepath, pars, callback, errcallback, varArr) => {
	preGetMid++;
	var r = new XMLHttpRequest();
	r.open(getMethod, filepath, true);
	var mime;
	switch (fileType) {
		case 'html':
		case 'txt':
			mime = 'text/html';
			break;
		case 'json':
			mime = 'application/json';
			break;
		default:
			mime = 'application/x-www-form-urlencoded';
	}
	r.setRequestHeader('Content-type', mime);
	r.onload = () => {
		if (r.status != 200) {
			// Handle application level error.
			preGetMid--;
			if (errcallback) {
				errcallback(r.responseText, r.status, varArr);
			} else {
				console.log('Tried to get file: ' + filepath + ', but failed with error code: ' + r.status);
			}
			return;
		}
		preGetMid--;
		if (callback !== null) {
			callback(r.responseText, varArr);
		}
	};
	r.onerror = () => {
		// Handle network level error.
		preGetMid--;
		if (errcallback) {
			errcallback('Network error', 0, varArr);
		} else {
			console.log('Tried to get file: ' + filepath + ', but failed due to a network error.');
		}
	};
	if (getMethod == 'POST' && pars !== null) {
		r.send(pars);
	} else {
		r.send();
	}
};
