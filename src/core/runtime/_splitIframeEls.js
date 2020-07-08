const _splitIframeEls = (sel, relatedObj=null, compDoc=null) => {
	let targSel, iframeID;
	let root = (relatedObj && typeof relatedObj == 'object') ? _getRootNode(relatedObj) : null;
	let doc = document, hostIsShadow = false, hostIsScoped = false, splitSel = false;
	if (root && !root.isEqualNode(document)) {
		// This was called from within a shadow or scoped component object. The doc defaults to the shadowRoot or the scoped host.
		doc = root;
		if (supportsShadow && root instanceof ShadowRoot) {
			hostIsShadow = true;
		} else {
			hostIsScoped = true;
		}
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
				} else if (!hostIsScoped) {
					// The parent is the host is the root in a scoped component, and doc is already set to the root.
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
		if (!hostIsScoped) {
			root = _getRootNode(root.host);
			doc = root;
		} else {
			doc = _getRootNode(root);
		}
	} else if (compDoc && !splitSel) {
		// Use the default shadow doc. This could be a componentOpen, and unless there's a split selector involved, we need to default to the shadow doc provided.
		doc = compDoc;
	}

	return [doc, targSel, iframeID];
};
