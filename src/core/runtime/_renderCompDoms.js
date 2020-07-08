const _renderCompDoms = (o, compDoc=o.doc) => {
	// Set up any shadow DOM and scoped components so far unrendered and remove these from the pending shadow DOM and scoped array that contains the HTML to draw.
	// Shadow DOM and scoped content strings are already fully composed with valid Active IDs at this point, they are just not drawn yet.
	// Search for any data-acss-component tags and handle.
	compDoc.querySelectorAll('data-acss-component').forEach(function (obj, index) {
		_renderCompDomsDo(o, obj);

		// Quick way to check if shadow DOMs and scoped variables are being cleaned up. Leave this here please.
		// At any time, only the existing scoped vars and shadows should be shown.
//		console.log('Current shadow DOMs');
//		console.log(shadowDoms);
//		console.log('scopedData:');
//		console.log(scopedData);
//		console.log('scopedVars:');
//		console.log(scopedVars);

	});
};
