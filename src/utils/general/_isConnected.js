const _isConnected = obj => {
	return (obj.isConnected || obj === self || obj === document.body);
};
