const _renderIt = (o, content, childTree, selfTree) => {
	// All render functions end up here.
	// Convert the string into a node tree. Shadow DOMs and scoped components are handled later on. Every render command goes through here, even ones from render
	// events that get drawn in _renderCompDoms. It's potentially recursive. We need to handle the draw event for any non-shadow renders. Using a mutation observer
	// has proven to be over-wieldy due to the recursive nature of rendering events within and outside components, so we'll use a simple analysis to pin-point
	// which new elements have been drawn, and manually set off the draw event for each new element as they get drawn. This way we shouldn't get multiple draw
	// events on the same element.

	let isIframe, drawArr = [];
	isIframe = (o.secSelObj.tagName == 'IFRAME') ? true : false;
	// If true this is a direct render into an iframe. Iframe components can be rendered within a rendered string also with wrap-around iframe tags.
	// If it has been rendered within a component, the whole iframe and contents will be available in the content string.
	// Handle both scenarios here. There may be multiple iframes output in a single render embedded in the render string, so this need to work on
	// all of those. Probably best to render the content without the inner iframe stuff first, and then attach create the iframes after that.

	// run something that extracts the iframe content and returns a temporary array with iframe activeids and contents and a content string without the
	// iframe insides. Also if there is a src tag, rename that to something else and make sure it goes back after generating the iframe.
	// If isIframe is true, then instead create the temporary tag results and generate iframe here and skip the remainder of this script entirely.

	// don't forget to handle target selector insertion after this too.

	let container = document.createElement('div');

	let iframes = [];
	if (content.indexOf('<iframe') !== -1) {
		// Prepare dynamic iframes for later rendering if it looks like they might be there.
		let contentObj = _sortOutDynamicIframes(content);
		content = contentObj.str;
		iframes = contentObj.iframes;
	}

	// If the first element is a table inner element like a tr, things like tr and subsequent tds are going to disappear with this method.
	// All we have to do is change these to something else, and put them back afterwards. One method used here is a replace. Probably could be better.
	// It just needs to survive the insertion as innerHTML. Test case is /manual/each.html from docs site - "@each - array of objects".
	let trFix = false;
	if (TABLEREGEX.test(content)) {
		// Optimization idea: It may be quicker to just wrap the whole string in a table tag, with a tr if it's a td. Should then convert fine in theory.
		// Then just remove afterwards. Rather than this hacky workaround. Or maybe not - we would still need the active ID carried over, which would have to
		// be done lower down. The question is, is that handling faster than the current one? If so, do it, but it's not clear-cut at this point without doing it.
		trFix = true;
		content = content.replace(/\/tr>/gmi, '\/acssTrTag>').
			replace(/\/td>/gmi, '\/acssTdTag>').
			replace(/\/table>/gmi, '\/acssTableTag>').
			replace(/\/tbody>/gmi, '\/acssTbodyTag>').
			replace(/\/th>/gmi, '\/acssThTag>').
			replace(/<tr/gmi, '<acssTrTag').
			replace(/<td/gmi, '<acssTdTag').
			replace(/<table/gmi, '<acssTableTag').
			replace(/<tbody/gmi, '<acssTbodyTag').
			replace(/<th/gmi, '<acssThTag');
	}

	content = _escapeInnerQuotes(content);

	container.innerHTML = content;

	// Get the number of child elements and nodes. Remember that rendering doesn't have to include child elements.
	// This is used for core scope options later on in _renderCompDomsDo.
	let numTopElementsInRender = container.childElementCount;
	let numTopNodesInRender = container.childNodes.length;

	let cid;
	// Make a list of all immediate children via a reference to their Active IDs. After rendering we then iterate the list and run the draw event.
	// We do this to make sure we only run the draw events on the new items.
	// There are positions - it isn't always a straight inner render. And there can be more than one immediate child element.
	container.childNodes.forEach(function (nod) {	// This should only be addressing the top-level children.
		if (nod.nodeType !== Node.ELEMENT_NODE) return;		// Skip non-elements.
		if (nod.tagName == 'DATA-ACSS-COMPONENT') return;	// Skip pending data-acss-component tags.
		cid = _getActiveID(nod);	// Assign the active ID in a temporary state.
		drawArr.push(cid);
	});

	// We need this - there are active IDs in place from the _getActiveID action above, and we need these to set off the correct draw events.
	content = container.innerHTML;

	// Put any trs and tds back.
	if (trFix) {
		content = content.replace(/acssTrTag/gmi, 'tr').
			replace(/acssTdTag/gmi, 'td').
			replace(/acssTableTag/gmi, 'table').
			replace(/acssTbodyTag/gmi, 'tbody').
			replace(/acssThTag/gmi, 'th');
	}

	// We only do this next one from the document scope and only once.
	if (!o.component) {
		// First remove any tags that are about to be removed. This MUST happen before the addition - don't put it into node mutation.
		let configRemovalCheck = true;
		if (o.renderPos && !isIframe) {
			if (o.renderPos == 'replace') {
				// Check everything from o.secSelObj down. Here, just check the o.secSelObj and check the rest below.
				if (_isACSSStyleTag(o.secSelObj)) {
					_regenConfig(o.secSelObj, 'remove');
				}
			} else {
				// No need to do anything - content isn't being replaced.
				configRemovalCheck = false;
			}
		}
		if (configRemovalCheck) {
			// Check everything below o.secSelObj down.
			o.secSelObj.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
				_regenConfig(obj, 'remove');
			});
		}

		// Now it is safe to add new config.
		content = _addInlinePriorToRender(content);
	}

	// Handle any reference to {$CHILDREN} that need to be dealt with with these child elements before any components get rendered.
	if (childTree != '') content = _renderRefElements(content, childTree, 'CHILDREN');

	// Handle any reference to {$SELF} that needs to be dealt with before any components get rendered.
	if (selfTree != '') content = _renderRefElements(content, selfTree, 'SELF');

	// Unescape any escaped curlies, like from $HTML_NOVARS or variables referenced within string variables now that rendering is occurring and iframe content is removed.
	content = _unEscNoVars(content);

	if (o.renderPos && !isIframe) {
		if (o.renderPos == 'replace') {
			o.secSelObj.insertAdjacentHTML('beforebegin', content);	// Can't replace a node with potentially multiple nodes.
			o.secSelObj.remove();
		} else {
			o.secSelObj.insertAdjacentHTML(o.renderPos, content);
		}
	} else {
		o.secSelObj.innerHTML = content;
	}

	// Create any iframes that are needed from the temporary iframe array.
	if (iframes.length > 0) {
		_resolveDynamicIframes(iframes, o);
	}

	if (isIframe) return;

	if (drawArr.length == 0 && o.secSelObj.parentNode) {
		// What was rendered was the inner contents of an element only, so we need to remove var placeholders on the node itself.
		// May as well use the parent of the target selector to ensure we got it (only if it hasn't been replaced by the render).
		// This could be tweaked to be more exact.
		_removeVarPlaceholders(o.secSelObj.parentNode);
	}

	let item, el;
	let attrRemoveDoc = (_checkScopeForEv(o.evScope) === false) ? document : o.doc;
	for (item of drawArr) {
		el = attrRemoveDoc.querySelector('[data-activeid="' + item + '"]');
		if (!el) continue;

		if (el.tagName != 'IFRAME') {
			_removeVarPlaceholders(el);
			_replaceTempActiveID(el);
		}
		el.querySelectorAll('[data-activeid]').forEach(function(obj) {	// jshint ignore:line
			if (obj.tagName == 'IFRAME') return;
			_replaceTempActiveID(obj);
		});

		if (!el || el.shadow || el.scoped || el.tagName == 'IFRAME') continue;		// We can skip tags that already have shadow or scoped components.

  		_handleDrawScope({ obj: el, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });

		el.querySelectorAll('*:not(template *)').forEach(function(obj) {	// jshint ignore:line
			// We can potentially have the same element running a draw event twice. Like the first draw event can add content inside any divs in the first object, which
			// could run this script again. When it finishes that run, it would then come back and run the loop below. And thereby running the draw event twice.
			// So we mark the element as drawn and don't run it twice. It gets marked as drawn in _handleEvents.
			if (obj._acssDrawn || ['DATA-ACSS-COMPONENT', 'IFRAME'].indexOf(obj.tagName) !== -1) return;		// Skip pending data-acss-component tags. Note that node may have changed.
			_handleDrawScope({ obj: obj, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo });
		});
	}

	_renderCompDoms(o, undefined, childTree, numTopNodesInRender, numTopElementsInRender);
};
