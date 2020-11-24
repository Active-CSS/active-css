function _fail(testEl, message=null, par1=null, par2=null, par3=null, par4=null, par5=null, par6=null, par7=null) {
	// This could be optimized...
	if (!testEl) {
		console.log('Failed to fail test because main element is missing - message:' + message, par1, par2, par3, par4, par5, par6, par7);
	}
	testEl.classList.add('failed');
	if (message) {
		if (par7) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5, par6, par7);
		} else if (par6) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5, par6);
		} else if (par5) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5);
		} else if (par4) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4);
		} else if (par3) {
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