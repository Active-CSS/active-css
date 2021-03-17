const _varFixArr = path => {
	let pathArr = path.split('.');
	let thisPath, newPath = pathArr.shift();	// Shift assigns and removes the first item, so all items following get a dot, so it's quicker in the loop.
	for (thisPath of pathArr) {
		if (thisPath.indexOf(' ') !== -1) {
			thisPath = '["' + thisPath.replace(/\\([\s\S])|(")/, "\\$1$2") + '"]';
		} else {
			newPath += '.';
		}
		newPath += thisPath;
	}
	return newPath;
};
