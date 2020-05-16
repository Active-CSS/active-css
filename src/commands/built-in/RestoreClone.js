_a.RestoreClone = o => {
	// This has a settimeout so it puts it at the end of the queue so other things can be destroyed if they are going on.
	let el = _getSel(o, o.actVal);
	let ref = el.dataset.activeid;
	if (!mimicClones[ref]) return;	// Clone not there.
	if (el.tagName == 'IFRAME') {
		if (el.contentWindow.document.readyState != 'complete') {
			return false;	// Don't bother restoring, iframe is changing. Barf out.
		}
		setTimeout(function() {
			el.contentWindow.document.body = mimicClones[ref];
		}, 0);
	} else {
		setTimeout(function() {
			let parEl = el.parentNode;
			parEl.replaceChild(mimicClones[ref], el);
			// Need to retrigger the draw events.
			_a.Trigger({ secSel: '', actVal: 'draw', secSelObj: parEl, ajaxObj: o.ajaxObj, e: o.el || null });
		}, 0);
	}
};
