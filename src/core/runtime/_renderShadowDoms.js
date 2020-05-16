const _renderShadowDoms = (o, shadowDoc=o.doc) => {
	// Set up any shadow DOM components so far unrendered and remove these from the pending shadow DOM array that contains the HTML to draw.
	// Shadow DOM content strings are already fully composed with valid Active IDs at this point, they are just not drawn yet.
	// Search for any data-shadow tags and handle.
	shadowDoc.querySelectorAll('data-shadow').forEach(function (obj, index) {
		_renderShadowDomsDo(o, obj);

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
