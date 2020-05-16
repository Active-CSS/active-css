_a.CopyToClipboard = o => {
	let el = _getSel(o, o.actVal);
	var arr = ['INPUT', 'TEXTAREA'];
	if (arr.indexOf(el.tagName) !== -1) {
		let rO = (el.getAttribute('readonly') == 'readonly') ? true : false;
		el.removeAttribute('readonly');
		el.select();
		document.execCommand('copy');
		if (rO) el.setAttribute('readonly', 'readonly');
	} else {
		let txt = document.createElement('textarea');
		txt.id = 'activecss-copy-field';
		txt.innerHTML = el.innerText;
		document.body.appendChild(txt);
		let docTxt = document.getElementById('activecss-copy-field');
		docTxt.select();
		document.execCommand('copy');
		ActiveCSS._removeObj(docTxt);
	}
};
