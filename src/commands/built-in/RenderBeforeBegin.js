_a.RenderBeforeBegin = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'beforebegin'; _a.Render(o);
};
