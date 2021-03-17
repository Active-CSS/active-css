// For Firefox 48.
if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (callback, thisArg) {
		thisArg = thisArg || window;
		let i = 0;
		for (i; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	};
}
