// Courtesy of https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab
// Modded to return undefined if not set instead of null.
const _get = (object, keys, defaultVal=undefined) => {
	keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
	object = object[keys[0]];
	if (object && keys.length > 1) {
		return _get(object, keys.slice(1), defaultVal);
	}
	return object === undefined ? defaultVal : object;
};
