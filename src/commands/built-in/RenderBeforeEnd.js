_a.RenderBeforeEnd = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'beforeend'; _a.Render(o);
};
