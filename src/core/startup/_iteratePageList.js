const _iteratePageList = (pages, removeState=false) => {
	if (!('content' in document.createElement('template'))) {
		console.log('Browser does not support html5. Cannot instantiate page navigation.');
		return;
	}
	let templ = document.getElementById('data-active-pages');
	if (!templ) {
		templ = document.createElement('template');
		templ.id = 'data-active-pages';
		document.body.appendChild(templ);
	}
	var counter, page, attrs, el;
	let rand = Math.floor(Math.random() * 10000000);
	Object.keys(pages).forEach(function(key) {
		page = pages[key].name;
		if (!page) return;
		attrs = pages[key].value.replace(/\{\$RAND\}/g, rand);
		let cleanPage = page.replace(/"/g, '').trim();
		let pConcat = cleanPage + ' ' + attrs.trim();
		let pos = pagesDisplayed.indexOf(cleanPage);
		if (pos !== -1) {
			if (removeState) {
				pagesDisplayed.splice(pos, 1);
				let el = templ.querySelector('[href="' + cleanPage + '"]');
				if (el) el.remove();
			}
			return;
		}
		pagesDisplayed.push(cleanPage);
		templ.insertAdjacentHTML('beforeend', '<a href=' + pConcat + '>');
	});
};
