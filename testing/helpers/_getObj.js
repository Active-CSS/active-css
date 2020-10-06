function _getObj(str, doc=document) {
	return (str == 'body') ? doc.body : doc.querySelector(str);
}
