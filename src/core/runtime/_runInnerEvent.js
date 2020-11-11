const _runInnerEvent = (sel, ev, doc=document, initialization=false) => {
	let noDrawTwiceCheck = (ev == 'draw' && initialization);	// If new elements get added during body:init, then it's possible draw events can happen on the same thing twice, hence this line.
	if (typeof sel == 'string') {
		doc.querySelectorAll(sel).forEach(function(obj) {
			if (!obj._acssDrawn || !noDrawTwiceCheck) _handleEvents({ obj: obj, evType: ev });
		});
	} else {
		// This is a draw trigger on an element, which should include its contents.
		_handleEvents({ obj: sel, evType: ev });
		_runInnerEvent('*', ev, sel);
	}
};
