// Renders the now visible component when render-when-visible option is on component.
const _handleCompIO = entries => {
	entries.forEach(entry => {
		if (entry.intersectionRatio > 0) {
			let el = entry.target;
			let props = el._acssCompIO;
			_renderCompDomsDo(props.o, props.obj, props.childTree, props.numTopNodesInRender, props.numTopElementsInRender);
		}
	});
};
