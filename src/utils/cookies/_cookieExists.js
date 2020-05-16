/* Cookie framework incorporated into core from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
const _cookieExists = nam => {
    if (!nam || /^(?:expires|max\-age|path|domain|secure)$/i.test(nam)) { return false; }
   	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(nam).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};
