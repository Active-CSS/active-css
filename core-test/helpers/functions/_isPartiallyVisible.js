// This checks if an element is at least partially visible. Used for testing the scroll-into-view command.
function _isPartiallyVisible(el) {
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (elTop < window.innerHeight && elBot >= 0);
}
