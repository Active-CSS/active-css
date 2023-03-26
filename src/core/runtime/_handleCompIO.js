// Renders the now visible component when render-when-visible option is on component.
const _handleCompIO = entries => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			let el = entry.target;
			let props = el._acssCompIO;
			el.removeAttribute('data-pending-visible');
			_renderCompDomsDo(props.o, props.obj, props.childTree, props.numTopNodesInRender, props.numTopElementsInRender);
		}
	});
};
