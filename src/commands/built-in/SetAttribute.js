_a.SetAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let htmlEntityDecode = false;
	let str = o.actVal;
	if (str.endsWith(' html-entity-decode')) {
		htmlEntityDecode = true;
		str = str.substr(0, str.length - 19).trim();
	}
	str = str._ACSSSpaceQuoIn();
	let attrArr = str.split(' ');
	let strToInsert = _handleQuoAjax(o, attrArr[1])._ACSSSpaceQuoOut();
	strToInsert = (htmlEntityDecode) ? _unHtmlEntities(strToInsert) : strToInsert;
	if (o.func == 'SetProperty') {
		o.secSelObj[attrArr[0]] = (strToInsert == 'true') ? true : (strToInsert == 'false') ? false : strToInsert;
	} else {
		o.secSelObj.setAttribute(attrArr[0], strToInsert);
	}
};
