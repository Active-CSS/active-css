/* Combines a draw event with checking the element to see if it has a scoped component. */
const _handleDrawScope = evObj => {
	let el = evObj.obj;
	if (compPreRendered.length > 0 && _isComponentable(el) && !el._acssComponent) {
		// See if this element needs to be attached to a @scope.
		compPreRendered.forEach(sel => {
			if (el.matches(sel.substring(1).replace('%%', ':'))) {
				_renderCompDomsDo({}, el, el.children, 0, 0, sel);
			}
		});
	}
	_handleEvents(evObj);
};
