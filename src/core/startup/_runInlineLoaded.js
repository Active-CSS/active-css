const _runInlineLoaded = () => {
	inlineIDArr.forEach(activeID => {
		_handleEvents({ obj: '~_inlineTag_' + activeID, evType: 'loaded' });
	});
	inlineIDArr = [];
};
