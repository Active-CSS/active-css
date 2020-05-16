const _drawHighlight = (rect, disp) => {
	let ov = document.createElement('div');
	ov.classList = 'activecss-internal-devtools-overlay';
	if (disp == 'full') {
		ov.style.backgroundColor = 'rgba(81, 136, 195, 0.46)';
		ov.style.border = '1px solid #34f4ff';
	} else {
		ov.style.border = '3px dashed #34f4ff';
	}
	ov.style.position = 'fixed';
	ov.style.zIndex = '99999999999999';
	ov.style.display = 'block';
	ov.style.borderRadius = '3px';
	ov.style.top = rect.y + 'px';
	ov.style.left = rect.x + 'px';
	ov.style.width = rect.width + ((!isNaN(rect.width)) ? 'px' : '');
	ov.style.height = rect.height + ((!isNaN(rect.height)) ? 'px' : '');
	document.body.appendChild(ov);
};
