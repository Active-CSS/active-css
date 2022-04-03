/**
 * Performs an XHR request with callbacks and error handlings.
 *
 * Called by:
 *	_ajaxDo()
 *	_getFile()
 *
 * Side-effects:
 *	Performs an XHR request with callbacks and consoles errors.
 *	Increments/decrements the internally global preGetMid variable.
 *
 * @private
 * @param {String} getMethod: The method, GET, POST, etc.
 * @param {String} fileType: The response type, "html", "txt", "json" or something else which will use "application/x-www-form-urlencoded".
 * @param {String} filepath: The full URL.
 * @param {String} pars: The string of parameters to send as POST vars separated by "&".
 * @param {Function} callback: The success callback function.
 * @param {Function} errcallback: The error callback function.
 * @param {Object} o: Action flow object (optional).
 *
 * @returns nothing
 */
 const _ajax = (getMethod, fileType, filepath, pars, callback, errcallback, o) => {
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
	if (o) {
		if (o.csrf) {
			// Is there a meta tag with X-CSRF-TOKEN present?
			let metaEl = document.querySelector('meta[name="csrf-token"]');
			if (metaEl) {
				r.setRequestHeader('X-CSRF-TOKEN', metaEl.getAttribute('content'));
			}
		}
		if (o.xhrHeaders) {
			let xhrHeaderObj;
			for (const xhrHeaderObj of o.xhrHeaders) {
				try {
					r.setRequestHeader(xhrHeaderObj.key, xhrHeaderObj.val);
				} catch (err) {
					_err('Invalid header and value used in ajax request', o, 'header:', (xhrHeaderObj ? xhrHeaderObj.key : xhrHeaderObj), 'value:', (xhrHeaderObj ? xhrHeaderObj.val : xhrHeaderObj));
				}
			}
		}
	}

	r.onload = () => {
		if (r.status != 200) {
			// Handle application level error.
			preGetMid--;
			if (errcallback) {
				errcallback(r.responseText, r.status, o);
			} else {
				_err('Tried to get file: ' + filepath + ', but failed with error code: ' + r.status, o);
			}
			return;
		}
		preGetMid--;
		if (callback !== null) {
			callback(r.responseText, o);
		}
	};
	r.onerror = () => {
		// Handle network level error.
		preGetMid--;
		if (errcallback) {
			errcallback('Network error', 0, o);
		} else {
			_err('Tried to get file: ' + filepath + ', but failed due to a network error.');
		}
	};
	if (getMethod == 'POST' && pars !== null) {
		r.send(pars);
	} else {
		r.send();
	}
};
