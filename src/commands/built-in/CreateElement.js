_a.CreateElement = o => {
	let aV = o.actVal, tag, upperTag, attrArr, attr, attrs = '', customTagClass, createTagJS, component, splitAV;
	splitAV = aV.split(' ');
	tag = splitAV[0];
	upperTag = tag.toUpperCase();

	let addedThisBefore = false;
	if (customTags.includes(upperTag)) {
		addedThisBefore = true;
	}

	// This is always need here. This should work on pre-rendered elements as long as the create-element is in preInit.
	// We need to remember this, and use it in _handleevents, as we won't run a component delineated event, we will run this main event draw event. Still without
	// leaving the component scope though. We just want this check in one little place in handleEvents and it should all work.
	// We have the customTags already in an array. If the event is a draw event and the element tag is in the array, we run the main draw event.

	if (splitAV[1] && splitAV[1].indexOf('observe(') === -1) {
		component = splitAV[1];
		if (config[tag] === undefined) config[tag] = {};
		if (config[tag].draw === undefined) config[tag].draw = {};
		if (config[tag].draw[0] === undefined) config[tag].draw[0] = [];
		if (config[tag].draw[0][0] === undefined) config[tag].draw[0][0] = [];
		let secSel = [];
		secSel['&'] = [];
		// Note: Below, "_acss-host_" is used to specify that the component definitely has a host so it should be scoped when rendering.
		// Components by default do not necessarily need to be scoped for performance reasons, but in this case we need to easily cover different possibilities
		// related to needing a host element. This was brought about by the need to nail down the handling for reference to {@host:...} variables.
		secSel['&'][0] = { file: '', line: '', intID: intIDCounter++, name: 'render-before-end', value: '"{|_acss-host_' + component + '}" after stack' };

		// Don't add it if it's already there.
		if (!addedThisBefore || typeof config[tag].draw[0][0][0] === 'undefined' ||
				typeof config[tag].draw[0][0][0]['&'] === 'undefined' ||
				typeof config[tag].draw[0][0][0]['&'][0] === 'undefined' ||
				config[tag].draw[0][0][0]['&'][0].name != 'render-before-end' ||
				config[tag].draw[0][0][0]['&'][0].value != '"{|_acss-host_' + component + '}" after stack'
			) {
			// Put the draw event render command at the beginning of any draw event that might already be there for this element.
			config[tag].draw[0][0].unshift(secSel);
			_setupEvent('draw', tag);
		}
	}

	if (addedThisBefore) return;

	// Get attributes. Cater for the possibility of multiple spaces in attr() list in actVal.
	attrArr = _getParVal(aV, 'observe').split(' ');
	for (attr of attrArr) {
		if (!attr) continue;
		attrs += "'" + attr.trim() + "',";
	}
	customTags.push(upperTag);

	// Create the custom tag.
	customTagClass = tag._ACSSConvFunc();
	createTagJS =
		'ActiveCSS.customHTMLElements.' + customTagClass + ' = class ' + customTagClass + ' extends HTMLElement {';
	if (attrs) {
		createTagJS +=
			'static get observedAttributes() {' +
				'return [' + attrs.slice(0, -1) + '];' +	// trim off trailing comma from attrs.
			'}';
	}

	// Note: connectedCallback, etc. are not working as expected in components, so this below is undocumented code and needs to be fixed to get working.
	// The code is left here in case people are using it. But it does needs proper address at some point. At some point in time it would have done something.

	createTagJS +=
			'constructor() {' +
				'super();' +
			'}' +
			'connectedCallback() {' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'connectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });' +
			'}' +
			'disconnectedCallback() {' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'disconnectedCallback\', component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope, runButElNotThere: true });' +	// true = run when not there.
			'}';
	if (attrs) {
		createTagJS +=
			'attributeChangedCallback(name, oldVal, newVal) {' +
				'if (!oldVal && oldVal !== \'\' || oldVal === newVal) return;' +	// skip if this is the first time in or there's an unchanging update.
				'this.setAttribute(name + \'-old\', oldVal); ' +
				'let ref = this._acssActiveID.replace(\'d-\', \'\') + \'HOST\' + name;' +
				'ActiveCSS._varUpdateDom([{currentPath: ref, previousValue: oldVal, newValue: newVal, type: \'update\'}]);' +
				'let compDetails = _componentDetails(this);' +
				'_handleEvents({ obj: this, evType: \'attrChange\' + name._ACSSConvFunc(), component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope });' +
				// Handle shadow DOM observe event. Ie. Tell the inner DOM elements that something has changed outside. We only do this when there has
				// been a change with the host attributes so we keep the isolation aspect of each shadow DOM. This way, the inner component can set
				// an observe event on the host, which is outside of the actual shadow DOM.
				'if (this.shadowRoot) _handleObserveEvents(null, this.shadowRoot);' +
			'}';
	}
	createTagJS +=
		'};' +
		'customElements.define(\'' + tag + '\', ActiveCSS.customHTMLElements.' + customTagClass + ');';
	Function('_handleEvents, _componentDetails, _handleObserveEvents, escapeHTML, unEscapeHTML', '"use strict";' + createTagJS)(_handleEvents, _componentDetails, _handleObserveEvents, escapeHTML, unEscapeHTML);	// jshint ignore:line
};
