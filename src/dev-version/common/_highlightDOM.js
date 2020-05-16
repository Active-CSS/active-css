ActiveCSS._highlightDOM = sel => {
	sel = _stripOffConditionals(sel);
	if (sel == 'body' || sel == 'window') {
		_drawHighlight({ x: 0, y: 0, width: '100%', height: '100%' }, 'full');
	} else {
		let rect;
	    try {
			document.querySelectorAll(sel).forEach(function (obj) {
				// Is this element hidden?
				if (getComputedStyle(obj, null).display !== 'none') {
					// Draw full block highlight.
					_drawHighlight(obj.getBoundingClientRect(), 'full');
				} else {
					// It is hidden, so display it briefly, get it's size and then hide it again.
					// Draw a dashed line highlight.
					// Restore display style setting to original values so we don't mess up the web page.
					let currPropValue = obj.style.getPropertyValue('display');
					let currPropPriority = obj.style.getPropertyPriority('display');
					obj.style.setProperty('display', 'block', 'important');
					_drawHighlight(obj.getBoundingClientRect());
					if (currPropValue !== '') {
						obj.style.removeProperty('display');
					} else {
						obj.style.setProperty('display', currPropValue, currPropPriority);
					}
				}
			});
	    } catch(err) {
	        console.log(sel + ' is not a valid selector.');
	    }
	}
};
