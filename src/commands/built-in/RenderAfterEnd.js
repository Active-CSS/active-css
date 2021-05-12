_a.RenderAfterEnd = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'afterend'; _a.Render(o);
};