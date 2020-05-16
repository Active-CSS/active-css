_a.LoadImages = o => {
	// eg. load-images: data-cjs-images
	// Looks for all attributes in o.actVal and puts that contents into the src, then removes the attribute.
	let attr = o.actVal;
	o.doc.querySelectorAll('img[' + attr + '], picture source[' + attr + ']').forEach(function (obj, index) {
		let attrName = (obj.tagName == 'IMG') ? 'src' : 'srcset';
		obj.setAttribute(attrName, obj.getAttribute(attr));
		obj.removeAttribute(attr);	// So it doesn't try to load it twice.
	});
};
