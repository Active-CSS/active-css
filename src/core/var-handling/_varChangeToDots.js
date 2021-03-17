const _varChangeToDots = str => {
	return str.replace(/\[(\"|\')?/g, '.').replace(/(\"|\')?\]/g, '');
};
