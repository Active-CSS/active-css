ActiveCSS._deHighlightDOM = () => {
	// Just get rid of all overlays on the screen.
	document.querySelectorAll('.activecss-internal-devtools-overlay').forEach(function (obj) {
		ActiveCSS._removeObj(obj);
	});
};
