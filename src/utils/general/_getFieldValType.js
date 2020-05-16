const _getFieldValType = obj => {
	switch (obj.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			return 'value';
		default:
			return 'innerText';
	}
};
