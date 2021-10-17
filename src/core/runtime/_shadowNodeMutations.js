ActiveCSS._shadowNodeMutations = mutations => ActiveCSS._nodeMutations(mutations, null, mutations[0].target.getRootNode(), true);	// true = insideShadowDOM
