const _checkForm = (frm, wot) => {
	// opt = 'check' (check if changed), 'pars' (generate as ajax parameters)
	if (!frm) return false;	// form not there, so unchanged.
	var check = (wot == 'check');
	var pars = (wot == 'pars');
	var parStr = '', parAdd = '&';
	var changed = [], n, c, def, i, ol, opt, valu;
	for (var e = 0, el = frm.elements.length; e < el; e++) {
		n = frm.elements[e];
		c = false;
 		if (!n.hasAttribute('name') || n.disabled) continue;
		switch (n.nodeName.toLowerCase()) {
			case 'input':
				switch (n.type.toLowerCase()) {
					case 'checkbox':
						c = (n.checked != n.defaultChecked);
						parStr += parAdd + n.getAttribute('name') + '=' + ((n.checked) ? ((n.value) ? n.value : 'on') : '');
						break;
					case 'radio':
						c = (n.checked != n.defaultChecked);
						if (n.checked) {
							parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value);
						}
						break;
					default:
						c = (n.value != n.defaultValue);
						parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value);
						break;
				}
				break;

			case 'select':
				def = 0;
				for (i = 0, ol = n.options.length; i < ol; i++) {
					opt = n.options[i];
					c = c || (opt.selected != n.defaultSelected);
					if (opt.defaultSelected) def = i;
				}
				if (c && !n.multiple) c = (def != n.selectedIndex);
				parStr += parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.options[n.selectedIndex].value);
				break;

			case 'textarea':
			default:
				c = (n.value != n.defaultValue);
				parStr += (pars) ? parAdd + n.getAttribute('name') + '=' + encodeURIComponent(n.value) : '';
				break;
		}
		if (check && c) {
			changed.push(n);
		}
	}
	if (check) {
		return (changed.length) ? true : false;
	} else if (pars) {
		return '_ACSSFORMNAME=' + (frm.name ? frm.name : '') + parStr;
	}
};


/*
const _checkForm = frm => {
	return Array.from(frm).some(el => {
		switch (el.nodeName.toLowerCase()) {
			case 'input':
				switch (el.type.toLowerCase()) {
					case 'checkbox':
					case 'radio':
						if (el.checked != el.defaultChecked) return true;
						break;

					default:
						if (el.value != el.defaultValue) return true;
						break;
				}
				break;

			case 'select':
				// Doesn't yet support multiple option selects.
				let def = 0, i, ol, opt, c;
				for (i = 0, ol = el.options.length; i < ol; i++) {
					opt = el.options[i];
					c = c || (opt.selected != el.defaultSelected);
					if (opt.defaultSelected) def = i;
				}
				if (c && !el.multiple) {
					if (def != el.selectedIndex) return true;
				}
				break;

			case 'textarea':
			default:
				if (el.value != el.defaultValue) return true;
				break;
		}
		return false;
	});
};
*/
