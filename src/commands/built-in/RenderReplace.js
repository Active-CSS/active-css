_a.RenderReplace = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.renderPos = 'replace'; _a.Render(o);
};
