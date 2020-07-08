// Edge hack - just get it vaguely working on old Edge. Shadow DOM components are not supported in Edge, so they won't work in Active CSS either.
if (!document.head.attachShadow) {
	supportsShadow = false;
	if (!('isConnected' in Node.prototype)) {
		Object.defineProperty(Node.prototype, 'isConnected', {
			get() {
				return (!this.ownerDocument || !(this.ownerDocument.compareDocumentPosition(this) & this.DOCUMENT_POSITION_DISCONNECTED));
			},
		});
	}
}
