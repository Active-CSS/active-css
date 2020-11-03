const _renderIt = (o, content, childTree, selfTree) => {
	// All render functions end up here.
	// Convert the string into a node tree. Shadow DOMs and scoped components are handled later on. Every render command goes through here, even ones from render
	// events that get drawn in _renderCompDoms. It's potentially recursive. We need to handle the draw event for any non-shadow renders. Using a mutation observer
	// has proven to be over-wieldy due to the recursive nature of rendering events within and outside components, so we'll use a simple analysis to pin-point
	// which new elements have been drawn, and manually set off the draw event for each new element as they get drawn. This way we shouldn't get multiple draw
	// events on the same element.

	let container = document.createElement('div');
	container.innerHTML = content;

	// Make a list of all immediate children via a reference to their Active IDs. After rendering we then iterate the list and run the draw event.
	// We do this to make sure we only run the draw events on the new items.
	// There are positions - it isn't always a straight inner render. And there can be more than one immediate child element.
	let drawArr = [], item, cid;
	container.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);	// Assign the active ID in a temporary state.
		drawArr.push(cid);
	});

	// We need this - there are active IDs in place from the _getActiveID action above, and we need these to set off the correct draw events.
	content = container.innerHTML;

	if (o.renderPos) {
		if (o.renderPos == 'replace') {
			o.secSelObj.insertAdjacentHTML('beforebegin', content);	// Can't replace a node with potentially multiple nodes.
			o.secSelObj.remove();
		} else {
			o.secSelObj.insertAdjacentHTML(o.renderPos, content);
		}
	} else {
		o.secSelObj.innerHTML = content;
	}

	if (drawArr.length == 0) {
		// What was rendered was the inner contents of an element only, so we need to remove var placeholders on the node itself.
		// May as well use the parent of the target selector to ensure we got it. This could be tweaked to be more exact.
		_removeVarPlaceholders(o.secSelObj.parentNode);
	}

	for (item of drawArr) {
		let el = o.doc.querySelector('[data-activeid=' + item + ']');
		_removeVarPlaceholders(el);
		_replaceTempActiveID(el);
		el.querySelectorAll('[data-activeid]').forEach(function(obj) {	// jshint ignore:line
			_replaceTempActiveID(obj);
		});
		if (!el || el.shadow || el.scoped) continue;		// We can skip tags that already have shadow or scoped components.
		_handleEvents({ obj: el, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		el.querySelectorAll('*').forEach(function(obj) {	// jshint ignore:line
			// We can potentially have the same element running a draw event twice. Like the first draw event can add content inside any divs in the first object, which
			// could run this script again. When it finishes that run, it would then come back and run the loop below. And thereby running the draw event twice.
			// So we mark the element as drawn and don't run it twice. It gets marked as drawn in _handleEvents.
			if (obj._acssDrawn || obj.tagName == 'DATA-ACSS-COMPONENT') return;		// Skip pending data-acss-component tags. Note that node may have changed.
			_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
		});
	}

	_renderCompDoms(o, undefined, childTree);
};
