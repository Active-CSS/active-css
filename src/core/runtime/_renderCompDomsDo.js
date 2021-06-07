const _renderCompDomsDo = (o, obj, childTree) => {
	let shadowParent, strictlyPrivateEvents, privateEvents, parentCompDetails, isShadow, shadRef, varScope, evScope, componentName, template, shadow, shadPar, shadEv, strictVars;

	shadowParent = obj.parentNode;
	parentCompDetails = _componentDetails(shadowParent);

	shadRef = obj.getAttribute('data-ref');
	// Determine if this is a shadow or a scoped component. We can tell if the mode is set or not.
	componentName = obj.getAttribute('data-name');
	strictlyPrivateEvents = components[componentName].strictPrivEvs;
	privateEvents = components[componentName].privEvs;
	isShadow = components[componentName].shadow;
	strictVars = components[componentName].strictVars;

	// We have a scenario for non-shadow DOM components:
	// Now that we have the parent node, is it a dedicated parent with no other children? We need to assign a very specific scope for event and variable scoping.
	// So check if it already has child nodes. If it does, then it cannot act as a host. Components must have dedicated hosts. So we will add one later.
	// Shadow DOM components already have hosts, so this action of assigning a host if there is not one does not apply to them.
	let scopeEl;
	if (!isShadow && shadowParent.childNodes.length > 1) {
		scopeEl = document.createElement('acss-scope');
		shadowParent.replaceChild(scopeEl, obj);
		// Switch the parent to the new scoping element.
		shadowParent = scopeEl;
	} else {
		obj.remove();	// Remove the shadow DOM reference tag.
	}

	if (isShadow && shadowParent.shadowRoot) {
		// This is an additional shadow render covering the same area, but we already have this covered.
		_renderCompDomsClean(shadRef);
		return;
	}

	varScope = _getActiveID(shadowParent).replace('id-', '_');
	// Set the variable scope up for this area. It is really important this doesn't get moved otherwise the first variable set in the scope will only initialise
	// the scope and not actually set up the variable, causing a hard-to-debug "variable not always getting set" scenario.
	if (scopedProxy[varScope] === undefined) {
		scopedProxy[varScope] = {};
	}

	evScope = varScope;		// This needs to be per component for finding event per component when looping.

	// Set up a private variable scope reference if it is one so we don't have to pass around this figure.
	// Note that the scope name, the varScope, is not the same as the component name. The varScope is the reference of the unique scope.
	privVarScopes[varScope] = components[componentName].privVars ? true: false;

	// Set up map per component of higher-level variable scopes to iterate when getting or setting vars. This is for non-"strictlyPrivateVars" components.
	// It should be only necessary to reference the fact that the current component has a sharing parent.
	// If there is no parent because this the document scope, then there is no parent.
	// If the parent is the document scope, there may be no o.varscope, so it is marked as "main" to show it is available.

	let varScopeToPassIn = (privVarScopes[varScope]) ? varScope : (o.varScope) ? o.varScope : null;
	o.varScope = varScopeToPassIn;

	// Get the parent component details for event bubbling (not element bubbling).
	// This behaviour is exactly the same for shadow DOMs and non-shadow DOM components.
	// The data will be assigned to the compParents array further down this page once we have the component drawn.
	compParents[evScope] = parentCompDetails;
	strictCompPrivEvs[evScope] = strictlyPrivateEvents;
	compPrivEvs[evScope] = privateEvents;

	let embeddedChildren = false;
	if (compPending[shadRef].indexOf('{$CHILDREN}') !== -1) {
		compPending[shadRef] =  _renderRefElements(compPending[shadRef], childTree, 'CHILDREN');
		embeddedChildren = true;
	}

	strictPrivVarScopes[evScope] = strictVars;

	// Store the component name in the element itself. We don't need to be able to select with it internally, so it is just a property so we don't clutter the
	// html more than we have to. It is used by the Elements extension for locating related events, which requires the component name, and we have the element at
	// that point so we don't need to search for it.
	shadowParent._acssComponent = componentName;
	shadowParent._acssVarScope = varScopeToPassIn;
	shadowParent._acssStrictPrivEvs = strictlyPrivateEvents;
	shadowParent._acssPrivEvs = privateEvents;
	shadowParent._acssStrictVars = strictVars;
	shadowParent._acssEvScope = evScope;

	// Run a beforeComponentOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeComponentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: undefined, component: componentName, _maEvCo: o._maEvCo });

	// Start mapping the variables - we're going to output them all at the same time to avoid progressive evaluation of variables within the substituted content itself.

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str: compPending[shadRef],
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: varScopeToPassIn,
			shadowParent: shadowParent
		}
	);
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			varScope: varScopeToPassIn,
		},
		strObj.ref
	);
	// Lastly, handle any {$STRING} value from ajax content if it exists.
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			o: o.ajaxObj,
			varScope: varScopeToPassIn,
		},
		strObj.ref
	);
	// Output the variables for real from the map.
	compPending[shadRef] = _resolveVars(strObj.str, strObj.ref);

	compPending[shadRef] = _replaceComponents(o, compPending[shadRef]);

	// Unescape any escaped curlies, like from $HTML_NOVARS or variables referenced within string variables now that rendering is occurring and iframe content is removed.
	compPending[shadRef] = _unEscNoVars(compPending[shadRef]);

	template = document.createElement('template');
	template.innerHTML = compPending[shadRef];

	// Remove the pending shadow DOM instruction from the array as it is about to be drawn, and some other clean-up.
	_renderCompDomsClean(shadRef);

	if (isShadow) {
		try {
			shadow = shadowParent.attachShadow({mode: components[componentName].mode});
		} catch(err) {
			console.log('Active CSS error in attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err);
		}
	} else {
		shadow = shadowParent;
		shadow.setAttribute('data-active-scoped', '');
		shadow._acssScoped = true;
	}

	// Set the top level event scope which is used to search for target selectors in the correct scope.
	// If the component is within a private event scope then that is the scope unless it's further down inside a shadow DOM.
	// Otherwise it's in the inner shadow DOM scope or the document scope.
	if (isShadow) {
		// The shadow is the top level doc.
		shadowParent._acssTopEvDoc = shadow;
	} else if (privateEvents || strictlyPrivateEvents) {
		// The parent is the top level doc when running events inside the component.
		shadowParent._acssTopEvDoc = shadowParent;
	} else if (parentCompDetails.topEvDoc) {
		// Set the top level event scope for this component for quick reference.
		shadowParent._acssTopEvDoc = parentCompDetails.topEvDoc;
	} else {
		// The document is the top level doc.
		shadowParent._acssTopEvDoc = document;
	}
	// For private events, but only when running inherited events, the top level doc is parentCompDetails.topEvDoc.
	// I think there could be more to this - like the main focus should be on the target selector.
	if (privateEvents) {
		if (parentCompDetails.topEvDoc) {
			shadowParent._acssInheritEvDoc = parentCompDetails.topEvDoc;
		} else {
			shadowParent._acssInheritEvDoc = document;
		}
	}
	shadowDoms[varScope] = shadow;
	// Get the actual DOM, like document or shadow DOM root, that may not actually be shadow now that we have scoped components.
	actualDoms[varScope] = (isShadow) ? shadow : shadow.getRootNode();

	// Attach the shadow or the insides.
	shadow.appendChild(template.content);

	if (!embeddedChildren && childTree) {
		// Attach unreferenced children that need to be outside the shadow or the insides - basically it will go at the end of the container.
		shadowParent.insertAdjacentHTML('beforeend', childTree);
	}

	shadow.querySelectorAll('[data-activeid]').forEach(function(obj) {
		_replaceTempActiveID(obj);
	});

	let docToPass = (isShadow || strictlyPrivateEvents || privateEvents) ? shadow : o.doc;

	// Run a componentOpen custom event, and any other custom event after the shadow is attached with content. This is run on the host object.
	setTimeout(function() {
		// Remove the variable placeholders.
		_removeVarPlaceholders(shadow);

		_handleEvents({ obj: shadowParent, evType: 'componentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: docToPass, component: componentName, _maEvCo: o._maEvCo });

		shadow.querySelectorAll('*:not(template *)').forEach(function(obj) {
			if (obj.tagName == 'DATA-ACSS-COMPONENT') {
				// Handle any shadow DOMs now pending within this shadow DOM.
				_renderCompDomsDo(o, obj);
				return;
			}
			// Run draw events on all new elements in this shadow. This needs to occur after componentOpen.
			_handleEvents({ obj: obj, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: varScopeToPassIn, evScope, compDoc: docToPass, component: componentName, _maEvCo: o._maEvCo });
		});
	}, 0);

	if (isShadow) {
		// Now add all possible window events to this shadow, so we can get some proper bubbling order going on when we handle events that don't have any real event
		// in the shadow. We have to do this - it's to do with future potential events being added during runtime and the necessity of being able to trap them in the
		// real target so we can initiate true bubbling.
		// Note that this looks "great - why don't we add it to the main set event stuff?" The reason being that we want to setup on only the events we use, and not all
		// events. We don't want to slow up the document unnecessarily. But we have to for shadow DOMs otherwise we never get a proper event target and we can't bubble.
		// We can't bubble because we bubble only on the target. We skip upper parent DOM events altogether, which are registered in the wrong order for bubbling, and
		// we can't manipulate the order of those because browsers do not allow a true clone of an event object and everything goes weird.
		// Basically, if you click on a sub-shadow DOM element and there is no event set on the DOM, it does not trigger IN the shadow DOM. The target is never reached.
		// So we make sure there is always going to be a shadow DOM event triggered by setting up all possible events. Technically overkill, but we have to do this.
		// It would be nice if there was a way to get the truly real target on any click, regardless of whether or not it is in a shadow DOM. But thankfully there is
		// e.composedPath(), otherwise we'd be royally buggered.
		let thisEv;
		if (allEvents.length == 0) {
			Object.keys(window).forEach(key => {
			    if (/^on/.test(key)) {
			    	thisEv = key.slice(2);
			    	allEvents.push(thisEv);
					_attachListener(shadow, thisEv, false, true);	// for speed.
			    }
			});
		} else {
			for (thisEv of allEvents) {
				_attachListener(shadow, thisEv, false, true);
			}
		}
	}
};
