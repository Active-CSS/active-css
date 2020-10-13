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
	let drawArr = [], item, cid;
	container.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);
		drawArr.push(cid);
	});
	content = container.innerHTML;

	// PUT IN A CHECK HERE TO MAKE SURE THIS IS IN THE DOCUMENT SCOPE.
	if (content.indexOf('@host:') !== -1) {	// For speed.
		// Handle any document scope references to host attributes now that we have a full render tree.
		// This will ignore any components to be rendered later in this render cycle, so should be relatively fast.
		container.querySelectorAll('*').forEach(function(obj) {	// jshint ignore:line
			let thisInnerHTML = obj.innerHTML;
			let checkHTML = obj.outerHTML.replace(thisInnerHTML, '');
			if (checkHTML.indexOf('@host:') !== -1) {
				if (obj.parentElement) {
					let newObj = _htmlToElement(_replaceScopedVars(checkHTML, obj, 'SetAttribute', null, false, obj.parentElement));
					obj.replaceWith(newObj);
				}
			}
		});
	}
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

	for (item of drawArr) {
		let el = o.doc.querySelector('[data-activeid=' + item + ']');
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
