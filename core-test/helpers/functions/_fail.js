function _fail(testEl, message=null, par1=null, par2=null, par3=null) {
	testEl.classList.add('failed');
	if (message) {
		if (par3) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3);
		} else if (par2) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2);
		} else if (par1) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1);
		} else {
			console.log('Failure in ' + testEl.id + ': ' + message);
		}
	}
}