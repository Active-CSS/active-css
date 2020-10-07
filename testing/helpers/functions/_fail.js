function _fail(testEl, message=null, par1=null) {
	testEl.classList.add('failed');
	if (message) {
		if (par1) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1);
		} else {
			console.log('Failure in ' + testEl.id + ': ' + message);
		}
	}
}