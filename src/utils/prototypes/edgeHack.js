// Edge hack - just get it vaguely working on old Edge. Web components are not supported. This is a temporary measure to give basic version 1 core support
// until a better solution is found.
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
