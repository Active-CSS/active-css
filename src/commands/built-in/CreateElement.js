_a.CreateElement = o => {
	let aV = o.actVal, tag, attrArr, attr, attrs = '', customTagClass, createTagJS;
	tag = aV.split(' ')[0];
	if (customTags.includes(tag)) return;	// The custom tag is already declared - skip it.
	aV = aV.replace(tag, '').trim();

	// Get attributes. Cater for the possibility of multiple spaces in attr() list in actVal.
	attrArr = _getParVal(aV, 'observe').split(' ');
	for (attr of attrArr) {
		if (!attr) continue;
		attrs += "'" + attr.trim() + "',";
	}
	customTags.push(tag);

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
	createTagJS +=
			'constructor() {' +
				'super();' +
			'}' +
			// Recommend that the internal Active CSS "draw" event is used for consistency.
			'connectedCallback() {' +
				// Run the connectedCallback event though if it exists in the config.
				'_handleEvents({ obj: this, evType: \'connectedCallback\' });' +
			'}' +
			'disconnectedCallback() {' +
				'_handleEvents({ obj: this, evType: \'disconnectedCallback\', runButElNotThere: true });' +	// true = run when not there.
			'}' +
			'adoptedCallback() {' +
				'_handleEvents({ obj: this, evType: \'adoptedCallback\' });' +
			'}';
	if (attrs) {
		createTagJS +=
			'attributeChangedCallback(name, oldVal, newVal) {' +
				'if (!oldVal) return;' +	// skip if this is the first time in, as it's an addition not an update.
				'this.setAttribute(name + \'-old\', oldVal); ' +
				'let ref = this.getAttribute(\'data-activeid\').replace(\'d-\', \'\') + \'HOST\' + name;' +
				'ActiveCSS._varUpdateDom([{currentPath: ref, previousValue: oldVal, newValue: newVal, type: \'update\'}]);' +
				'_handleEvents({ obj: this, evType: \'attrChange-\' + name });' +
			'}';
	}
	createTagJS +=
		'};' +
		'customElements.define(\'' + tag + '\', ActiveCSS.customHTMLElements.' + customTagClass + ');';
	Function('_handleEvents', '"use strict";' + createTagJS)(_handleEvents);	// jshint ignore:line
};
