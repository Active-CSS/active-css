const _wrapUpStart = (o) => {
	// The page has been reloaded. Every page in Active CSS must have an element that contains an href linking to it, which when clicked on will perform the
	// actions necessary to redraw the page. The page has just been loaded or reloaded, so there was no object clicked on to perform any actions yet.
	// So we need to find the href in the page that has the url, and based on that, we assume that clicking on this object will perform the correct actions
	// to redraw the page when necessary.

	if (!setupEnded) {
		if (document.readyState && document.readyState != 'complete') {
			// Initial document loading not completely ready, come back to this in 20ms.
			setTimeout(_wrapUpStart, 20);
			return;
		}

		// Set up any custom action commands or conditionals. These can be run everywhere - they are not isolated to components.
		_handleEvents({ obj: '~_acssSystem', evType: 'init' });

		// DOM cleanup observer. Note that this also picks up shadow DOM elements. Initialise it before any config events.
		elementObserver = new MutationObserver(ActiveCSS._nodeMutations);
		elementObserver.observe(document.body, {
			characterData: true,
			childList: true,
			subtree: true
		});

		setupEnded = true;

		// Handle any developer initialization events
		_handleEvents({ obj: 'body', evType: 'preInit' });

		_handleEvents({ obj: 'body', evType: 'init' });

		// Now run the loaded events for each inline Active CSS tag on the page. They were added all at once for speed.
		if (inlineIDArr.length > 0) _runInlineLoaded();

		// Iterate items on this page and do any draw events.
		_runInnerEvent(null, '*', 'draw', document, true);

		_handleEvents({ obj: 'body', evType: 'scroll' });	// Handle any immediate scroll actions on the body if any present. Necessary when refreshing a page.

		if (!inIframe) {
			let url = _resolveURL(window.location.href);
			window.history.replaceState(url, document.title, url);
		}

		document.dispatchEvent(new CustomEvent('ActiveCSSInitialized', {}));

		// Lazy load config.
		if (lazyConfig !== '') {
			setTimeout(function() {
				let arr = lazyConfig.split(','), configFile;
				for (configFile of arr) {
					_a.LoadConfig({ actName: 'load-config', actVal: configFile, doc: document});	// load-config param updates the panel.
				}
//				lazyConfig = '';
			}, 1000);
		}
	} else {
		// Now run the loaded events for each inline Active CSS tag on the page.
		if (inlineIDArr.length > 0) {
			_runInlineLoaded();
		}
	}

	if (concatConfigCo > concatConfigLen) {
		if (o.actName == 'load-config') {
			configArr.push(o.avRaw);	// Add the file without anything after and including the "?".
			// Handle updating the extensions. Either or not of them could be showing, so they either get an immediate update, or a flag is set for them to
			// update if they received the onShown event. Similar to the config update to the Panel whenever an element is edited in Elements.
			// It's slightly different in that we need the additional optional step of the immediate update instead of the onShown triggered update, plus
			// we need to update both Elements and Panel here, and not only the Panel as in the case of the edited element in Elements.
			if (setupEnded) {
				// Send a message to the extensions to update the config display. This goes to both extensions.
				if (debuggerActive) {
					_tellPanelToUpdate();
				}
				if (evEditorActive) {
					_tellElementsToUpdate();
				}
			}
			_handleEvents({ obj: 'body', evType: 'afterLoadConfig', eve: o.e });
			_handleEvents({ obj: o.obj, evType: 'afterLoadConfig', eve: o.e, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo, _taEvCo: o._taEvCo });
		}
	}
};
