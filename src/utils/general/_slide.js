const _slide = (o, opt) => {
	let sels = _getSels(o, o.actVal);
	if (sels) {
		let optMin = (opt == 'up');
		sels.forEach(function (el, index) {
			let activeID = _getActiveID(el);
			el.removeEventListener('transitionend', window['__acssSlideHeight' + activeID]);
			let nowHeight = el.offsetHeight + 'px';
			if (optMin) {
				el.style.setProperty('height', nowHeight);
				setTimeout(() => {
					el.style.removeProperty('height');
				}, 0);
			} else {
				el.style.setProperty('height', 'auto');
				let newHeight = el.offsetHeight + 'px';
				el.style.setProperty('height', nowHeight);
				setTimeout(() => {
					el.style.setProperty('height', newHeight);
				}, 0);
				window['__acssSlideHeight' + activeID] = (e) => {
					e.target.style.setProperty('height', 'auto');
				};
				el.addEventListener('transitionend', window['__acssSlideHeight' + activeID]);
			}
		});
	}
};
