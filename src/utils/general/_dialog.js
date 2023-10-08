const _dialog = (o, opt) => {
	let arr = _actValSelItem(o, true);	// true = get text in [0] instead of the element.
	let modal = (arr[1].toLowerCase() == 'modal');
	let closingVal = (opt == 'close' && arr[1].indexOf('"') !== -1) ? arr[1]._ACSSRepQuo() : undefined;
	let sel = (modal || opt == 'close' && closingVal) ? arr[0] : o.actVal;
	let sels = _getSels(o, sel);
	if (sels) {
		sels.forEach(function (el, index) {
			if (el.tagName !== 'DIALOG') _err('Element is not a valid dialog, element:', o, el);
			switch (opt) {
				case 'close':
					el.close(closingVal);
					break;
				case 'show':
					el[(modal ? 'showModal' : 'show')]();
					break;
			}
		});
	}
};
