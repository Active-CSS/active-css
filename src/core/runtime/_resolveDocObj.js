const _resolveDocObj = (doc) => {
	return (doc.nodeType !== Node.DOCUMENT_NODE) ? doc.getRootNode() : doc;
};
