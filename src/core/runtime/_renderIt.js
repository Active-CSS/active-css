const _renderIt = (o, content) => {
	// All render functions end up here.
	// Convert the string into a node tree. Shadow DOMs and scoped components are handled later on. Every render command goes through here, even ones from render
	// events that get drawn in _renderCompDoms. It's potentially recursive. We need to handle the draw event for any non-shadow renders. Using a mutation observer
	// has proven to be over-wieldy due to the recursive nature of rendering events within and outside components, so we'll use a simple analysis to pin-point
	// which new elements have been drawn, and manually set off the draw event for each new element as they get drawn. This way we shouldn't get multiple draw
	// events on the same element.
	let template = document.createElement('template');
	template.innerHTML = content;

	// Make a list of all immediate children via a reference to their Active IDs. After rendering we then iterate the list and run the draw event.
	let drawArr = [], item, cid;
	template.content.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);
		drawArr.push(cid);
	});
	content = template.innerHTML;

	if (o.renderPos) {
		o.secSelObj.insertAdjacentHTML(o.renderPos, content);
	} else {
		o.secSelObj.innerHTML = content;
	}

	for (item of drawArr) {
		let el = o.doc.querySelector('[data-activeid=' + item + ']');
		if (el.shadow || el.scoped) continue;							// We can skip tags that already have shadow or scoped components.
		_handleEvents({ obj: el, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		el.querySelectorAll('*').forEach(function(obj) {	// jshint ignore:line
			if (obj.tagName == 'DATA-ACSS-COMPONENT') return;		// Skip pending data-acss-component tags.
			_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		});
	}

	_renderCompDoms(o);
};
