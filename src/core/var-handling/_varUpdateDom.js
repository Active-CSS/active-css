/***
 * Called from _observable-slim.js after a change has been made to a scoped variable.
 *
 * How variable data-binding is handled in Active CSS. (Various notes written prior to implementation, so this isn't gospel.)
 * --------------------------------------------------------------------------------------------------------------------------
 * Direct changes to attributes are not covered here - this is just what happens when variables change, not attributes. See the create-element command for that code.
 *
 * All scoped variables that are set are contained to a IIFE limited variable "scoped", and changed via the notifier Proxy "scopedVars".
 * The "scoped" variable is not referenced directly.
 *
 * Each new variable that gets set adds to a mirror map of the scoped variable that is populated with data relating to what needs updating.
 * This array is created whenever an item is found to render. When a change is made, it is looked up in the render array and it is redrawn accordingly.
 *
 * Each time a variable is rendered, the Active ID related to the target is stored. This is vital for updates to both text content and attributes, to localise
 * any later DOM manipulation and make it quick to search for text nodes and to get the target element in the case of updating attributes.
 *
 * Handling text content in divs, etc. (eg. {{player}}):
 * The data object contains all the information necessary to re-render DOM location, indexed by unique Active ID, and within this can be found items such as
 * comment locations or element attribute locations.
 * Multiple comments fall under the ActiveID, as do multiple attribute locations (per element).
 * Data within comments get fully replaced. This is a simple search for a unique comment string under the Active ID element tree.
 *
 * Handling variables in attributes. (eg. {{player}})
 * Attributes are handled differently. The Active ID element is found. The unrendered string after attribute substitution is stored - this is once per element that
 * targets an attribute. Multiple variables or instances of the same variable can exist within one attribute.
 * On subsequent changes, the process happens again based on the string prior to the previous variable substition, but after the attribute substitution.
 *
 * In both rendering into attributes and regular text, if the element is no longer there, ie. the Active ID is no longer found on the page, then the variable
 * references are removed. This could be set to a remove var command which, on setting the var to a unique value, would trigger a deletion of the references
 * and a deletion of the variable from the scoped container.
 *
 * There should be a preInit event of some kind for the setting of variables so that they are present when the body is first drawn on the page, in the event of
 * server-side code containing vars to render. It should be in the docs that it is recommended for such divs to be hidden until the body draw event occurs, otherwise
 * people will see a flicker of "{player}" in text on the screen, rather than "Dave", during the period where Active CSS initializes.
 *
 * New components and content to render should have the variable substitution occur in the text to render *prior* to the final render of the text and the subsequent
 * draw event.
*/
ActiveCSS._varUpdateDom = (changes) => {
	/**
	 * changes contains eg.:
	 * change.type = add/update/delete	- used here
	 * change.target = ["X","O","X","O","O","X","","",""]
	 * change.property = "3"
	 * change.newValue = "O"
	 * change.previousValue = "";
	 * change.currentPath = "gameState.3"
	 * change.jsonPointer = "/gameState/3"
	 * change.proxy = ["X","O","X","O","O","X","","",""]
	*/

	let change, dataObj, changeDiff, innerChange;
	for (change of changes) {
		if (change.currentPath.indexOf('.') === -1 && change.currentPath.indexOf('HOST') === -1) continue;	// Skip all actions on the root scoped variable.
		if (typeof change.previousValue == 'object' || typeof change.newValue == 'object') {
			// This is an object or an array, or some sort of type change. Get a diff and apply the applicable change to each item.
			// The reason we've got here in the code is that a whole array is being redeclared or something, and there may be individually rendered sub-elements
			// we need to handle. If you redeclare a whole array, observableslim doesn't send multiple inner changes - so we need to simulate this instead so that
			// we can update the DOM. We're only making the specific changes needed - that's why we use a diff.
			change.previousValue = (!change.previousValue) ? [] : change.previousValue;
			// Sometimes previousValue is returned as a proxy from observableslim. Dunno why. Reference the non-scoped var if so, as it will have the same value.
			change.previousValue = (change.previousValue.__isProxy === true) ? change.previousValue.__getTarget : change.previousValue;
			// This next line brings back a complex object diff that indicates type of change.
			changeDiff = recursiveDiff.getDiff(change.previousValue, change.newValue);	// https://github.com/cosmicanant/recursive-diff
			for (innerChange of changeDiff) {
				innerChange.path = change.currentPath + ((!innerChange.path) ? '' : '.' + innerChange.path.join('.'));
				dataObj = _get(scopedData, innerChange.path);
				if (!dataObj) continue;		// No point doing anything yet - it's not been rendered.
				innerChange.val = (!innerChange.val) ? '' : innerChange.val;
				_varUpdateDomDo({
					currentPath: innerChange.path,
					newValue: innerChange.val,
					type: innerChange.op
				}, dataObj);	// We need this - we may have a complex object.
			}
		} else {
			dataObj = _get(scopedData, change.currentPath);
			if (!dataObj) continue;		// No point doing anything yet - it's not been rendered.
			_varUpdateDomDo(change, dataObj);
		}
	}
};

const _varUpdateDomDo = (change, dataObj) => {
	let refObj, cid, el, pos, treeWalker, commentNode, frag, thisNode, content, attrArr, attr, attrOrig, attrContent, theHost, theDoc, colonPos, obj, scopeRef;

	// Get the reference object for this variable path if it exists.
	refObj = change.newValue;

	// Handle content wrapped in comments.
	// Loop all items that are affected by this change and update them. We can get the Active IDs and isolate the tags required.
	colonPos = change.currentPath.indexOf('HOST');
	theHost = null;
	theDoc = document;
	let compScope = null;

	// There has been a recent change whereby the scope of the document may have nothing to with the scope of the variable. Ie. you can have nested shadow DOM
	// components in the document variable scope, or you could have a non-private component within a shadow DOM area.

	// dataObj contains the correct variable information. That contains the top host of the variable scope.
	// theDoc needs to contain the correct display root on a per item basis - so it cannot be worked out in advance.
	// Same for theHost. It can no longer be worked out in advance now that variable scoping spreads beyond component boundaries.

	// Is this a scoped component variable? If so, it will look something like this: _3.varname.
	if (change.currentPath.substr(0, 1) == '_') {
		compScope = change.currentPath.substr(0, change.currentPath.indexOf('.'));
		if (change.type == 'delete' && compScope == '') {
			// The whole scope has been deleted. Clean up.
			delete shadowDoms[change.currentPath];
			delete scopedData[change.currentPath];
			delete actualDoms[change.currentPath];
			return;
		}
	}
	for (obj in dataObj.cids) {
		// Locate and update inside comments.
		// Create a tree of comments to iterate. There's only one tag here, so there shouldn't be a huge amount. It would be very weird if there was.
		cid = dataObj.cids[obj].cid;
		scopeRef = dataObj.cids[obj].scopeRef;	// Scope ref is the *display* area - not the variable area!
		theDoc = (!scopeRef) ? document : actualDoms[scopeRef];
		if (typeof theDoc == 'undefined') continue;	// Not there, skip it. It might not be drawn yet.

		// The host specifically refers to the root containing the component, so if that doesn't exist, there is no reference to a host element.
		theHost = (supportsShadow && theDoc instanceof ShadowRoot) ? theDoc.host : theDoc.querySelector('[data-activeid="id-' + change.currentPath.substr(1, colonPos - 1) + '"]');

		el = theDoc.querySelector('[data-activeid="' + cid + '"]');
		if (!el) {
			// The node is no longer there at all. Clean it up so we don't bother looking for it again.
			delete dataObj.cids[cid];
			continue;
		}

		treeWalker = document.createTreeWalker(
			el,
			NodeFilter.SHOW_COMMENT
		);
		// Iterate tree and find unique ref enclosures and update within with newValue.
		frag = document.createTextNode(refObj);
		while (treeWalker.nextNode()) {
			thisNode = treeWalker.currentNode;
			if (thisNode.data != 'active-var-' + change.currentPath || thisNode.data == '/active-var' || !thisNode.parentNode.isEqualNode(el)) {
				treeWalker.nextNode();
				continue;	// If this isn't the same parent node or var change, skip it. We got all the appropriate nodes covered with el.
			}
			// Replace the text content of the fragment with new text.
			if (thisNode.nextSibling.data == '/active-var') {
				// There is no content there. Insert a text node.
				let newNode = document.createTextNode(frag.textContent);
				// Yeah, there is no insertAfter() and after() is not supported on Safari according to MDN...
				thisNode.parentNode.insertBefore(newNode, thisNode.nextSibling);
			} else {
				thisNode.nextSibling.textContent = frag.textContent;
			}
			// Move to the last tag. We know it won't match the first loop condition.
			treeWalker.nextNode();
		}

		// If this element is an inline-style tag, replace this variable if it is there.
		if (el.tagName == 'STYLE') {
			let regex = new RegExp('\\/\\*active\\-var\\-' + change.currentPath + '\\*\\/(((?!\\/\\*).)*)\\/\\*\\/active\\-var\\*\\/', 'g');
			let str = el.textContent;
			str = str.replace(regex, function(_, wot) {	// jshint ignore:line
				return '/*active-var-' + change.currentPath + '*/' + frag.textContent + '/*/active-var*/';
			});
			el.textContent = str;	// Set all instances of this variable in the style at once - may be more than one instance of the same variable.
		}
	}

	// Handle content in attributes.
	for (cid in dataObj.attrs) {
		scopeRef = dataObj.attrs[cid].scopeRef;	// Scope ref is the *display* area - not the variable area!
		theDoc = (!scopeRef) ? document : actualDoms[scopeRef];
		if (typeof theDoc == 'undefined') continue;	// Not there, skip it. It might not be drawn yet.

		// The host specifically refers to the root containing the component, so if that doesn't exist, there is no reference to a host element.
		theHost = (supportsShadow && theDoc instanceof ShadowRoot) ? theDoc.host : theDoc.querySelector('[data-activeid="id-' + change.currentPath.substr(1, colonPos - 1) + '"]');

		el = theDoc.querySelector('[data-activeid="' + cid + '"]');
		if (!el) {
			// The node is no longer there at all. Clean it up so we don't bother looking for it again.
			// Note the current method won't work if the same binding variable is in the attribute twice.
			// If anyone comes up with a sensible use case, we'll change this method, otherwise it's a bit too niche to put in provisions for
			// that scenario at this point.
			delete dataObj.attrs[cid];
			continue;
		}
		for (attr in dataObj.attrs[cid]) {
			attrOrig = dataObj.attrs[cid][attr].orig;
			if (!el.hasAttribute(attr)) return;	// Hasn't been created yet, or it isn't there any more. Skip clean-up anyway. Might need it later.
			// Regenerate the attribute from scratch with the latest values. This is the safest way to handler it and cater for multiple different variables
			// within the same attribute. Any reference to an attribute variable would already be substituted by this point.
			attrContent = _replaceScopedVars(attrOrig, null, '', null, true, theHost, compScope);
			el.setAttribute(attr, attrContent);
		}
	}
};
