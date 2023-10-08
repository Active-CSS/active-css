const _renderCompDoms = (o, compDoc=o.doc, childTree='', numTopNodesInRender=0, numTopElementsInRender=0) => {
	// Set up any shadow DOM and scoped components so far unrendered and remove these from the pending shadow DOM and scoped array that contains the HTML to draw.
	// Shadow DOM and scoped content strings are already fully composed with valid Active IDs at this point, they are just not drawn yet.
	// Search for any data-acss-component tags and handle.
	compDoc.querySelectorAll('data-acss-component:not([data-pending-visible])').forEach(function (obj, index) {
		// If this component requires dynamic loading of HTML or CSS, do that here and then come back when both are completed (if both are present).
		// This way we should get a non-flickering render, although rendering will be staggered due to dynamic loading.
		if (_isPendingAjaxForComponents(obj)) return;
		if (obj.hasAttribute('data-html-file') ||
				obj.hasAttribute('data-css-file') ||
				obj.hasAttribute('data-json-file') ||
				obj.hasAttribute('data-html-template') ||
				obj.hasAttribute('data-css-template')) {
			let readyToRenderNow = _grabDynamicComponentFile(obj, [ 'html', 'css', 'json', 'data-html-template', 'data-css-template' ], o, compDoc, childTree, numTopNodesInRender);
			if (!readyToRenderNow) return;
		}

		_renderCompDomsDo(o, obj, childTree, numTopNodesInRender, numTopElementsInRender);

		// Quick way to check if components and scoped variables are being cleaned up. Leave this here please.
		// At any time, only the existing scoped vars and shadows should be shown.
//		console.log('Current shadow DOMs', shadowDoms);
//		console.log('scopedData:', scopedData);
//		console.log('scopedProxy:', scopedProxy);
//		console.log('actualDoms:', actualDoms);
//		console.log('compParents:', compParents);
	});

	function _grabDynamicComponentFile(obj, arr, o, compDoc, childTree, numTopNodesInRender, numTopElementsInRender) {
		let readyToRenderNow = true;
		arr.forEach(typ => {
			if (typ.endsWith('template') && obj.hasAttribute(typ)) {
				// Grab from a template and place directly into the compRender
				let templObj = _getSelector(o, obj.getAttribute(typ));
				if (templObj.obj) {
					let templNode = templObj.obj.cloneNode(true);
					let str = templNode.innerHTML;
					_insertResForComponents(obj, typ, str);
				} else {
					_warn('Could not find template ' + obj.getAttribute(typ) + ' in this scope. If the template tag is in the document scope, prefix with "document ->".', o);
				}
			} else {
				let elClass = typ + 'Pending';
				if (obj.classList.contains(elClass)) return;		// Already being loaded.
				let attr = 'data-' + typ + '-file';
				if (obj.hasAttribute(attr)) {
					readyToRenderNow = false;
					obj.classList.add(elClass);
					let command = unEscQuotes(obj.getAttribute(attr));
					obj.removeAttribute(attr);
					if (command.indexOf(' json ') !== -1) {
						command = command.replace(/ json /, ' html ');
					} else if (command.indexOf(' html ') === -1) {
						command += ' html';
					}
					let compName = obj.getAttribute('data-name');

					// Allow variable substitution.
					let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
						{
							str: command,
							func: o.func,
							o,
							obj: o.obj,
							secSelObj: o.secSelObj,
							varScope: o.varScope,
						}
					);
					command = _resolveVars(strObj.str, strObj.ref);

					_a.Ajax({ actVal: command, doc: o.doc, renderComp: true, renderObj: { renderO: o, typ, obj, compName, compDoc, childTree, numTopNodesInRender, numTopElementsInRender } });
				}
			}
		});
		return readyToRenderNow;
	}
};
