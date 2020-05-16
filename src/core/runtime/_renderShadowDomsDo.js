const _renderShadowDomsDo = (o, obj) => {
	let shadowParent, shadowMode, shadowRef, shadowID, componentName, template, shadow, shadPar, shadEv;

	shadowParent = obj.parentNode;
	shadowRef = obj.getAttribute('data-ref');
	shadowMode = obj.getAttribute('data-mode');
	componentName = obj.getAttribute('data-name');
	shadowParent.removeChild(obj);	// Remove the shadow DOM reference tag.

	if (shadowParent.shadowRoot) {
		// This is an additional render covering the same area, but we already have this covered. I don't think we can check this any earlier as an additional
		// component may be required in the same render in the same html string. It's worth looking over this again at a later date.
		_renderShadowDomsClean(shadowRef);
		return;
	}

	shadowID = _getActiveID(shadowParent).replace('id-', '_');

	// Run a beforeShadowOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeShadowOpen', shadowRef: shadowID, shadowDoc: shadow, component: componentName });

	shadowPending[shadowRef] = _replaceAttrs(o.obj, shadowPending[shadowRef], null, null, o.func, shadowID);
	shadowPending[shadowRef] = _replaceComponents(o, shadowPending[shadowRef]);

	// Now we can go through the shadow DOM contents and handle any host attribute references now that the host is set up.
	shadowPending[shadowRef] = _replaceScopedVars(shadowPending[shadowRef], o.secSelObj, o.func, o, false, shadowParent, shadowID);

	// Lastly, handle any {$STRING} value from ajax content if it exists. This must be done last, otherwise we risk var replacement changing content of the $STRING.
	shadowPending[shadowRef] = (shadowPending[shadowRef].indexOf('{$') !== -1) ? _replaceStringVars(o.ajaxObj, shadowPending[shadowRef]) : shadowPending[shadowRef];

	template = document.createElement('template');
	template.innerHTML = shadowPending[shadowRef];

	// Remove the pending shadow DOM instruction from the array as it is about to be drawn, and some other clean-up.
	_renderShadowDomsClean(shadowRef);

	try {
		shadow = shadowParent.attachShadow({mode: shadowMode});
	} catch(err) {
		console.log('Active CSS error in attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err);
		
	}
	// Store the component name in the element itself. We don't need to be able to select with it internally, so it is just a property so we don't clutter the
	// html more than we have to. It is used by the Elements extension for locating related events, which requires the component name, and we have the element at
	// that point so we don't need to search for it.
	shadowParent._acssComponent = componentName;
	shadowParent._acssShadowRef = shadowID;

	shadowDoms[shadowID] = shadow;
	// Attach the shadow.
	shadow.appendChild(template.content);

	// Run a shadowOpen custom event after the shadow is attached with content. This is run on the host object.
	setTimeout(function() {_handleEvents({ obj: shadowParent, evType: 'shadowOpen', shadowRef: shadowID, shadowDoc: shadow, component: componentName }); }, 0);

	// Run draw events on all new elements in this shadow.
	shadow.querySelectorAll('*').forEach(function(obj) {
		if (obj.tagName == 'DATA-SHADOW') {
			// Handle any shadow DOMs now pending within this shadow DOM.
			_renderShadowDomsDo(o, obj);
			return;
		}
		_handleEvents({ obj: obj, evType: 'draw', otherObj: o.ajaxObj, shadowRef: shadowID, shadowDoc: shadow, component: componentName });
	});

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
				_attachListener(shadow, thisEv, componentName, shadow, shadowID);	// for speed.
		    }
		});
	} else {
		for (thisEv of allEvents) {
			_attachListener(shadow, thisEv, componentName, shadow, shadowID);
		}
	}
};
