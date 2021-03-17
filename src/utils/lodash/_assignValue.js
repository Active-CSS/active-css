/**
* Assigns `value` to `key` of `object` if the existing value is not equivalent
* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
* for equality comparisons.
*
* @private
* @param {Object} object The object to modify.
* @param {string} key The key of the property to assign.
* @param {*} value The value to assign.
*/
const _assignValue = (object, key, value) => {
	var objValue = object[key];
	if (!(hasOwnProperty.call(object, key) && _eq(objValue, value)) || (value === undefined && !(key in object))) {
		_baseAssignValue(object, key, value);
	}
};
