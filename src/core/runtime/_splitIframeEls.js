const _splitIframeEls = (sel, relatedObj=null, shadowDoc=null, evType=null) => {
	let targSel, iframeID;
	let root = (relatedObj && typeof relatedObj == 'object') ? _getRootNode(relatedObj) : null;
	let doc = document, hostIsShadow = false, splitSel = false;
	if (supportsShadow && root instanceof ShadowRoot) {
		// This was called from within a shadowRoot object. The doc defaults to the shadowRoot.
		doc = root;
		hostIsShadow = true;
	}
	if (sel.indexOf(' -> ') !== -1) {
		// Handle any doc reference first.
		splitSel = true;
		let ref;
		let refSplit = sel.split(' -> ');
		let co = 0;
		for (ref of refSplit) {
			co++;
			if (co == refSplit.length) break;	// Break before we get to the last one.
			if (ref == 'document') {
				doc = document;
			} else if (ref == 'parent') {
				if (hostIsShadow) {
					root = _getRootNode(root.host);
					doc = root;
				} else if (window.parent.document) {
					// Reference to an iframe host.
					doc = window.parent.document;
				} else {
					console.log('Active CSS error. Reference to a parent element that doesn\'t exist.');
				}
			} else {
				relatedObj = doc.querySelector(ref);
				if (relatedObj.shadowRoot) {
					doc = relatedObj.shadowRoot;
				} else if (relatedObj.tagName == 'IFRAME') {
					doc = relatedObj.contentWindow.document;
					iframeID = ref;
				} else {
					console.log('ref ' + ref + ' is unknown.');
					return false;
				}
			}
		}
		targSel = refSplit[refSplit.length - 1];

	} else {
		targSel = sel;
	}
	if (targSel == 'host') {
		root = _getRootNode(root.host);
		doc = root;
	} else if (shadowDoc && !splitSel) {
		// Use the default shadow doc. This could be a shadowOpen, and unless there's a split selector involved, we need to default to the shadow doc provided.
		doc = shadowDoc;
	}

	return [doc, targSel, iframeID];
};
