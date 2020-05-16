const _iteratePageList = pages => {
	if (!('content' in document.createElement('template'))) {
		console.log('Browser does not support html5. Cannot instantiate page navigation.');
		return;
	}
	let templ = document.createElement('template');
	templ.id = 'data-active-pages';
	var counter, page, attrs, el;
	let rand = Math.floor(Math.random() * 10000000);
	Object.keys(pages).forEach(function(key) {
		page = pages[key].name;
		if (!page) return;
		if (pageList.indexOf(page) !== -1) {
			console.log('Config error: Page ' + page + ' is referenced twice.');
		}
		attrs = pages[key].value.replace(/\{\$RAND\}/g, rand);
		templ.insertAdjacentHTML('beforeend', '<a href=' + page.trim() + ' ' + attrs.trim() + '>');
	});
	document.body.appendChild(templ);
};
