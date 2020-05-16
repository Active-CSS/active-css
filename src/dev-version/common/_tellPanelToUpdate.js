const _tellPanelToUpdate = () => {
	if (debuggerActive) {
		// Panel is active. We can send a message. No point doing this if it isn't active as it will get the latest config when it initialises anyway.
		_sendMessage('reloadPanel', 'instruction', 'tracker');
	}
};
