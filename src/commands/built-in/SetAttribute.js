_a.SetAttribute = o => {
	o.actVal = o.actVal._ACSSSpaceQuoIn();
	let attrArr = o.actVal.split(' ');
	attrArr[1] = _handleQuoAjax(o, attrArr[1])._ACSSSpaceQuoOut();
	o.secSelObj.setAttribute(attrArr[0], attrArr[1]);
};
