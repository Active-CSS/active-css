/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _getCookie = nam => {
	if (!nam) return null;
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
};
