_a.RenderAfterBegin = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'afterbegin'; _a.Render(o);
};
