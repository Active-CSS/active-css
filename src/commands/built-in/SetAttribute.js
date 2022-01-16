_a.SetAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let htmlEntityDecode = false;
	let str = o.actVal;
	if (str.endsWith(' html-entity-decode')) {
		htmlEntityDecode = true;
		str = str.substr(0, str.length - 19).trim();
	}
	let attrArr = str.split(' ');
	let attrName = attrArr.shift();
	let attrVal = attrArr.join(' ')._ACSSRepQuo();
	let strToInsert = (htmlEntityDecode) ? _unHtmlEntities(attrVal) : attrVal;
	if (o.func == 'SetProperty') {
		o.secSelObj[attrName] = (strToInsert == 'true') ? true : (strToInsert == 'false') ? false : strToInsert;
	} else {
		o.secSelObj.setAttribute(attrName, strToInsert);
	}
};
