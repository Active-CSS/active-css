ActiveCSS._returnTree = el => {
	if (!setupEnded) {
		return;
	}
	// Put the events for this element into an object for sending to the DevTools editor.
	// Handle all selectors.
	// selectors[thisAction]
	let act, itemConfig = {}, stopProp, arr, origEl = el, co, realEvent, mainElRoot, elRoot, origComponent;
	mainElRoot = _getRootNode(el);
	if (supportsShadow && mainElRoot instanceof ShadowRoot) {
		origComponent = mainElRoot.host._acssComponent;
		if (!origComponent) origComponent = null;		// Shadow found, but it wasn't set up by Active CSS - so ignore this element, as events won't work on those.
	}
	Object.keys(selectors).sort().forEach(function(act) {
		var doesBubble, doesBubbleOutOfShadow, component = '';
		el = origEl;
		co = 0;
		let ev = act;
		ev = _getRealEvent(ev);
		realEvent = true;
		if (ev === false) {
			realEvent = false;
		}
		component = origComponent;
		if (realEvent) {
			// Does this event bubble? There hasn't been a real event, and I know of no way to get the bubbles prop of an inaccessible event, so
			// simulate a real event to get the default bubbles property.
			// Create a shadow dom element to trigger the same event and don't let it bubble out. This should keep it out of the scope of the main document.
			// If we don't do this, we run the risk of running into user defined event handlers, which we don't want.
			let shadEl = document.createElement('div');
			shadEl.id = 'cause-js-elements-ext';
			document.body.append(shadEl);
			shadEl.attachShadow({ mode: 'open' });
			let inner = document.createElement('div');
			shadEl.shadowRoot.append(inner);
			inner.addEventListener(ev, function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				doesBubble = e.bubbles;
				doesBubbleOutOfShadow = e.composed;
			}, {capture: false, once: true});	// once = remove automatically after running.
			try {
				inner[ev]();
			} catch(err) {
				// This isn't a known event. Could be a user defined Active CSS event.
				doesBubble = false;
				doesBubbleOutOfShadow = false;
			}
			ActiveCSS._removeObj(shadEl);
		} else {
			// ActiveCSS events don't bubble.
			doesBubble = false;
			
		}
		if (act == 'mouseover' || act == 'click') {
			if (el.tagName == 'A' && el['data-active-nav'] !== 1) {
				// Set up any attributes needed for navigation from the routing declaration if this is being used.
				_setUpNavAttrs(el);
			}
		}
		if (el != 'window') {
			if (el) {
				// Note that we can't use .composedPath, as an event hasn't been fired. We have to work it out manually.
				while (el.parentNode) {
					arr = _miniHandleEventForEditor({ obj: el, thisAction: act, component: component });
					if (arr[1]) {
						if (!itemConfig[act]) itemConfig[act] = {};
						if (!itemConfig[act][co]) itemConfig[act][co] = {};
						itemConfig[act][co] = arr[0];
						co++;
					}
					if (!doesBubble) {
						break;
					}
					el = el.parentNode;
					if (el) {
						if (supportsShadow && el instanceof ShadowRoot) {
							// Reached the top of the shadow and we are in the shadow. Get the host.
							if (!doesBubbleOutOfShadow) {
								// The original element is in a shadow DOM, this parent node is not in the same shadow DOM and we are not supposed to bubble out. So...
								break;
							}
							el = el.host;
							let thisRootEl = _getRootNode(el);
							if (!thisRootEl.isEqualNode(document)) {
								component = thisRootEl.host._acssComponent;
								if (!component) component = null;	// Shadow found, but it wasn't set up by Active CSS - so ignore this element, as events won't work on those.
							} else {
								component = null;
							}
						}
					}
				}
				arr = _miniHandleEventForEditor({ obj: window, thisAction: act });
			}
		}
	});
	_sendMessage(itemConfig, 'treeSent', 'editor');
};
