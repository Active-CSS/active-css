// This has been set up to only run when Active CSS setup has fully loaded and completed.
ActiveCSS._nodeMutations = function(mutations, observer, dom=document, insideShadowDOM=false) {
	_handleObserveEvents(mutations, dom);

	mutations.forEach(mutation => {
		// Handle any observe events on the node itself.
		if (mutation.type == 'childList') {
			if (mutation.addedNodes) {
				if (DEVCORE) {
					mutation.addedNodes.forEach(nod => {
						if (!(nod instanceof HTMLElement)) return;
						// Handle the addition of embedded Active CSS styles into the config via DevTools. Config is already loaded if called via ajax.
						if (_isACSSStyleTag(nod) && !nod._acssActiveID && !_isInlineLoaded(nod)) {
							_regenConfig(nod, 'addDevTools');
						} else if (!insideShadowDOM) {		// cannot have ACSS style tags inside shadow DOM elements currently.
							nod.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
								if (!nod._acssActiveID && !_isInlineLoaded(nod)) _regenConfig(obj, 'addDevTools');
							});
						}
					});
				}
			}
		} else if (mutation.type == 'characterData' && !insideShadowDOM) {
			// Detect change to embedded Active CSS. The handling is just to copy the insides of the tag and replace it with a new one.
			// This will be sufficient to set off the processes to sort out the config.
			let el = mutation.target;
			if (el.nodeType == Node.TEXT_NODE && _isACSSStyleTag(el.parentElement)) {
				// We need to run this at the end of the call stack, otherwise we could clash with other stuff going on.
				setTimeout(function() {
					// This is an embedded Active CSS tag. Replace it so it triggers off the config changes.
					let parEl = el.parentElement;
					let newTag = '<style type="text/acss">' + parEl.innerText + '</style>';
					// Remove from the config first. If we remove the element after we've changed the content we get the scenario of the removal happening
					// after the addition and it buggers things up. So just do a manual removal.
					_regenConfig(parEl, 'remove');
					// Now we can safely add it.
					parEl.insertAdjacentHTML('beforebegin', newTag);	// Can't do a straight replace with a real node because of br tags being inserted.
					// Now change the type of the element so it doesn't get picked up in mutations.
					parEl.type = 'text/dummy';
					// Now it's safe to remove - it's not going to trigger a delete mutation.
					parEl.remove();
				}, 0);
			}
		}

		if (mutation.removedNodes) {
			mutation.removedNodes.forEach(nod => {
				if (!(nod instanceof HTMLElement)) return;
				// Now perform some clean-up on removed nodes. It doesn't have to be done immediately, so just do it after the current stack.
				// Note that nested shadow DOMs can also come into play here, and we need to clean up those too.
				setTimeout(function() {
					let ID = nod._acssActiveID;
					if (ID) {
						_deleteIDVars(ID);
						_deleteScopeVars('_' + ID.substr(3));
					}
					_recursiveScopeCleanUp(nod);

/*
					// This is handy for checking memory. Please don't remove.
					console.log('ActiveCSS._nodeMutations, scopedProxy:', scopedProxy,
						'scopedData:', scopedData,
						'varMap:', varMap,
						'varStyleMap:', varStyleMap,
						'clickOutsideSels:', varStyleMap,
						'idMap:', varStyleMap,
						'varInStyleMap:', varStyleMap,
						'compPending:', compPending,
						'compParents:', compParents,
						'compPrivEvs:', compPrivEvs,
						'actualDoms:', actualDoms,
						'delayArr:', delayArr,
						'idMap:', idMap,
						'cancelIDArr:', cancelIDArr,
						'cancelCustomArr:', cancelCustomArr
					);
*/
				}, 0);
			});
		}
	});
};
