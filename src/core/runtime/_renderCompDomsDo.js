const _renderCompDomsDo = (o, obj) => {
	let shadowParent, shadowMode, shadRef, compRef, componentName, template, shadow, shadPar, shadEv;

	shadowParent = obj.parentNode;
	shadRef = obj.getAttribute('data-ref');
	// Determine if this is a shadow or a scoped component. We can tell if the mode is set or not.
	componentName = obj.getAttribute('data-name');
	obj.remove();	// Remove the shadow DOM reference tag.
	shadowMode = components[componentName].mode;

	if (shadowMode && shadowParent.shadowRoot || !shadowMode && shadowParent._acssScoped) {
		// This is an additional render covering the same area, but we already have this covered. I don't think we can check this any earlier as an additional
		// component may be required in the same render in the same html string. It's worth looking over this again at a later date.
		_renderCompDomsClean(shadRef);
		return;
	}

	compRef = _getActiveID(shadowParent).replace('id-', '_');
	// Set the variable scope up for this area. It is really important this doesn't get moved otherwise the first variable set in the scope will only initialise
	// the scope and not actually set up the variable, causing a hard-to-debug "variable not always getting set" scenario.
	if (typeof scopedVars[compRef] === 'undefined') {
		scopedVars[compRef] = {};
	}

	// Set up a private scope reference if it is one so we don't have to pass around this figure.
	// Note that the scope name, the compRef, is not the same as the component name. The compRef is the reference of the unique scope.
	// Hence we need to do this at this point in the code.
	privateScopes[compRef] = components[componentName].priv ? true: false;

	// Run a beforeComponentOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeComponentOpen', compRef: compRef, compDoc: shadow, component: componentName });

	compPending[shadRef] = _replaceAttrs(o.obj, compPending[shadRef], null, null, o.func, compRef);
	compPending[shadRef] = _replaceComponents(o, compPending[shadRef]);

	// Now we can go through the shadow DOM contents and handle any host attribute references now that the host is set up.
	compPending[shadRef] = _replaceScopedVars(compPending[shadRef], o.secSelObj, o.func, o, false, shadowParent, compRef);

	// Lastly, handle any {$STRING} value from ajax content if it exists. This must be done last, otherwise we risk var replacement changing content of the $STRING.
	compPending[shadRef] = _replaceStringVars(o.ajaxObj, compPending[shadRef]);

	template = document.createElement('template');
	template.innerHTML = compPending[shadRef];

	// Remove the pending shadow DOM instruction from the array as it is about to be drawn, and some other clean-up.
	_renderCompDomsClean(shadRef);

	if (shadowMode) {
		try {
			shadow = shadowParent.attachShadow({mode: shadowMode});
		} catch(err) {
			console.log('Active CSS error in attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err);
		}
	} else {
		shadow = shadowParent;
		shadow.setAttribute('data-active-scoped', '');
		shadow._acssScoped = true;
	}

	// Store the component name in the element itself. We don't need to be able to select with it internally, so it is just a property so we don't clutter the
	// html more than we have to. It is used by the Elements extension for locating related events, which requires the component name, and we have the element at
	// that point so we don't need to search for it.
	shadowParent._acssComponent = componentName;
	shadowParent._acssCompRef = compRef;

	shadowDoms[compRef] = shadow;
	// Get the actual DOM, like document or shadow DOM root, that may not actually be shadow now that we have scoped components.
	actualDoms[compRef] = (shadowMode) ? shadow : shadow.getRootNode();

	// Attach the shadow.
	shadow.appendChild(template.content);

	// Run a componentOpen custom event, and any other custom event after the shadow is attached with content. This is run on the host object.
	setTimeout(function() {
		_handleEvents({ obj: shadowParent, evType: 'componentOpen', compRef: compRef, compDoc: shadow, component: componentName });

		shadow.querySelectorAll('*').forEach(function(obj) {
			if (obj.tagName == 'DATA-ACSS-COMPONENT') {
				// Handle any shadow DOMs now pending within this shadow DOM.
				_renderCompDomsDo(o, obj);
				return;
			}
			// Run draw events on all new elements in this shadow. This needs to occur after componentOpen.
			_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, compRef: compRef, compDoc: shadow, component: componentName });
		});
	}, 0);

	if (shadowMode) {
		// Now add all possible window events to this shadow, so we can get some proper bubbling order going on when we handle events that don't have any real event
		// in the shadow. We have to do this - it's to do with future potential events being added during runtime and the necessity of being able to trap them in the
		// real target so we can initiate true bubbling.
		// Note that this looks "great - why don't we add it to the main set event stuff?" The reason being that we want to setup on only the events we use, and not all
		// events. We don't want to slow up the document unnecessarily. But we have to for shadow DOMs otherwise we never get a proper event target and we can't bubble.
		// We can't bubble because we bubble only on the target. We skip upper parent DOM events altogether, which are registered in the wrong order for bubbling, and
		// we can't manipulate the order of those because browsers do not allow a true clone of an event object and everything goes weird.
		// Basically, if you click on a sub-shadow DOM element and there is no event set on the DOM, it does not trigger IN the shadow DOM. The target is never reached.
		// So we make sure there is always going to be a shadow DOM event triggered by setting up all possible events. Technically overkill, but we have to do this.
		// It would be nice if there was a way to get the truly real target on any click, regardless of whether or not it is in a shadow DOM, but that would partly
		// defeat the point of shadow DOMs. Thankfully there is e.composedPath(), otherwise we'd be royally buggered.
		let thisEv;
		if (allEvents.length == 0) {
			Object.keys(window).forEach(key => {
			    if (/^on/.test(key)) {
			    	thisEv = key.slice(2);
			    	allEvents.push(thisEv);
					_attachListener(shadow, thisEv, componentName, shadow, compRef);	// for speed.
			    }
			});
		} else {
			for (thisEv of allEvents) {
				_attachListener(shadow, thisEv, componentName, shadow, compRef);
			}
		}
	}
};
