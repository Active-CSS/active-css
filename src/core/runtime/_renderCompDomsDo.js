const _renderCompDomsDo = (o, obj, childTree, numTopNodesInRender, numTopElementsInRender) => {
	let shadowParent, strictlyPrivateEvents, privateEvents, parentCompDetails, isShadow, shadRef, varScope, evScope, componentName, template, shadow,
		shadPar, shadEv, strictVars, privVars, acceptVars;

	shadowParent = obj.parentNode;
	parentCompDetails = _componentDetails(shadowParent);
	shadRef = obj.getAttribute('data-ref');

	// Determine if this is a shadow or a scoped component. We can tell if the mode is set or not.
	componentName = obj.getAttribute('data-name');
	strictlyPrivateEvents = components[componentName].strictPrivEvs;
	privateEvents = components[componentName].privEvs;
	isShadow = components[componentName].shadow;
	strictVars = components[componentName].strictVars;
	privVars = components[componentName].privVars;
	acceptVars = components[componentName].acceptVars;

	// We have a scenario for non-shadow DOM components:
	// Now that we have the parent node, is it a dedicated parent with no other children? We need to assign a very specific scope for event and variable scoping.
	// So check if it already has child nodes. If it does, then it cannot act as a host. Components must have dedicated hosts. So we will add one later.
	// Shadow DOM components already have hosts, so this action of assigning a host if there is not one does not apply to them.
	let scopeEl;

	// Handle a spread scope - ie. multiple top-level nodes, that have been requested to be event scoped. We need a surrogate host from which to
	// run querySelectorAll for the events.
	// Otherwise, for non-shadow DOM components, the first element will be the host.
	// This is a change to previous behaviour, where if there was a parent element with only one child, then that would act as the host.
	// But that doesn't work with something like an li, a td, or sibling elements which can have multiple siblings but still need event isolation.
	// The host should really be the first child of the component, but event query selections need to include that first child, which is where it starts to
	// get tricky. I'm not going to enforce a container div like other frameworks, as that is a workaround and won't allow td and lis and siblings as
	// separate components.
	// Storing separate scope references in the parent element won't work either, as the DOM can change, and scope references could change with regards
	// the parent.
	// A way to do this could be:
	// 1. Attach the scope to the first child and not the parent. This is a bit challenging in itself.
	// 2. Don't attach a scope at all if it doesn't need one. Currently scopes are being added for all components and it isn't necessary.
	// 2. Have "queryselectorall" and "matches" with the same selector for target selection and action command selection.
	// This is only for everything except event selectors,that already uses matches. It might be ok.
	// It could be done that way only for those components that need it so as not to affect performance everywhere.
	// This selection wrapping function could be expand to allow multiple top level nodes in a component, but I don't know how much performance will be
	// affected. It might possibly be ok, as the main event loop won't need changing.
	// For now, this is a work in progress and the events section in the components area of the docs now has the note regarding trs and li scoped components.
	// This would be great to get eventually resolved. Another option is to allow host parents to hold multiple inner scopes, and that possibly may be
	// simpler to implement, or it may not.
	if (!isShadow && (
			privateEvents ||
			strictlyPrivateEvents ||
			privVars
			) &&
			(numTopNodesInRender > 0 && numTopElementsInRender > 1 ||	// like "<div></div><div></div>"
			numTopNodesInRender > 1 && numTopElementsInRender > 0)		// like "kjh<div></div>"
		) {
		// We need the surrogate host for this, otherwise the events won't be isolated to spreading scope nature of the render.
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
	privVarScopes[varScope] = privVars ? true: false;

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

	if (compPending[shadRef].indexOf('{$CHILDREN}') !== -1) {
		compPending[shadRef] =  _renderRefElements(compPending[shadRef], childTree, 'CHILDREN');
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

	if (compPendingJSON[shadRef] !== undefined) {
		// Convert JSON string to variables and get these declared in the correct component scope now that it has been established.
		let compScope = privVarScopes[varScopeToPassIn] ? varScopeToPassIn : 'main';
		for (const json in compPendingJSON[shadRef]) {
			// Send the JSON string through the same code as it would do if it was coming straight from loading.
			let res = JSON.parse(compPendingJSON[shadRef][json]);
			_resolveAjaxVarsDecl({ res, obj: shadowParent, evType: 'beforeComponentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: undefined, component: componentName, _maEvCo: o._maEvCo }, compScope);
		}
		// All tmp content has been replaced. Remove the placeholder reference from memory.
		delete compPendingJSON[shadRef];
	}

	// Run a beforeComponentOpen custom event before the shadow is created. This is run on the host object.
	// This is useful for setting variables needed in the component itself. It solves the flicker issue that can occur when dynamically drawing components.
	// The variables are pre-scoped to the shadow before the shadow is drawn.
	// The scope reference is based on the Active ID of the host, so everything can be set up before the shadow is drawn.
	_handleEvents({ obj: shadowParent, evType: 'beforeComponentOpen', eve: o.e, varScope: varScopeToPassIn, evScope, compDoc: undefined, component: componentName, _maEvCo: o._maEvCo });

	// Start mapping the variables - we're going to output them all at the same time to avoid progressive evaluation of variables within the substituted content itself.
	let strObj;

	if (acceptVars) {
		compPending[shadRef] = _resolveComponentAcceptedVars(compPending[shadRef], o, varScopeToPassIn, shadowParent);
	}

	if (compPendingHTML[shadRef] !== undefined) {
		// Replace the placeholders for content loaded from files that need variable substitution with variable-populated content.
		for (const tmpContent in compPendingHTML[shadRef]) {
			// Output the variables for real from the map.
			let newStr = _resolveComponentAcceptedVars(compPendingHTML[shadRef][tmpContent], o, varScopeToPassIn, shadowParent);
			compPending[shadRef] = compPending[shadRef].replace('_acssIntCompVarRepl' + tmpContent + '_', newStr);
		}
		// All tmp content has been replaced. Remove the placeholder reference from memory.
		delete compPendingHTML[shadRef];
	}

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
			shadowObservers[evScope] = new MutationObserver(ActiveCSS._shadowNodeMutations);
			shadowObservers[evScope].observe(shadow, {
				attributes: true,
				characterData: true,
				childList: true,
				subtree: true
			});
		} catch(err) {
			_err('Error attaching a shadow DOM object. Ensure the shadow DOM has a valid parent *tag*. The error is: ' + err, o);
		}
	} else {
		shadow = shadowParent;
		// All components need a scope, regardless of nature.
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
	shadow.innerHTML = '';
	shadow.appendChild(template.content);

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
			_handleEvents({ obj, evType: 'draw', eve: o.e, otherObj: o.ajaxObj, varScope: varScopeToPassIn, evScope, compDoc: docToPass, component: componentName, _maEvCo: o._maEvCo });
		});

		if (isShadow) {
			// Iterate elements in this shadow DOM component and do any observe events.
			// Note this needs to be here, because the elements here that are not components have already been drawn and so the observe
			// event in the mutation section would otherwise not get run.
			_runInnerEvent(null, '*:not(template *)', 'observe', shadow, true);

			// Iterate custom selectors that use the observe event and run any of those that pass the conditionals.
			_handleObserveEvents(null, shadow, true);
		}
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
		// Set up a separate change event for triggering an observe event on the native input event and for otherwise undetectable property changes.
		// Apologies in advance if this looks like a hack. If anyone has any better ideas to cover these scenarios, let me know.
		shadow.addEventListener('input', _handleShadowSpecialEvents);
		shadow.addEventListener('click', () => { setTimeout(_handleShadowSpecialEvents, 0); });
	}
};


const _resolveComponentAcceptedVars = (str, o, varScope, shadowParent) => {
	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope,
			shadowParent: shadowParent
		}
	);
	strObj = _handleVars([ 'strings', 'html' ],
		{
			str: strObj.str,
			varScope,
		},
		strObj.ref
	);
	// Lastly, handle any {$STRING} value from ajax content if it exists.
	strObj = _handleVars([ 'strings' ],
		{
			str: strObj.str,
			o: o.ajaxObj,
			varScope,
		},
		strObj.ref
	);

	let res = _resolveVars(strObj.str, strObj.ref);
	res = res.replace(/\\{/gm, '{').replace(/\\}/gm, '}');

	return res;
};
