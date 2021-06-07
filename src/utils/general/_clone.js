/* Does a shallow clone but maintains DOM references. Using a map rather than DOM elements in the event flow is an FP solution - do this at some point. */
const _clone = obj => {
	return Object.assign({}, obj);
};
