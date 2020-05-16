const _runInnerEvent = (sel, ev, doc=document) => {
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			_handleEvents({ obj: obj, evType: ev });
		});
	} else {
		// This is a draw trigger on an element, which should include its contents.
		_handleEvents({ obj: sel, evType: ev });
		_runInnerEvent('*', ev, sel);
	}
};
