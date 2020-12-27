const _readSiteMap = () => {
	// We have the config file loaded. Go through the config file and sort out the website objects and properties.
	// This is an SPA so we do everything first in a speedy fashion - we only do this once.
	// Don't forget that load-config runs this too, so anything for first initialization needs to be with the !setupEnded condition.
	var debugConfig = (debugMode) ? _doDebug('parser') : false;
	if (debugConfig) console.log(parsedConfig);

	if (!setupEnded) {
		// We are going to automatically set up which events can be declared as passive events, and we need to know if the browser supports passive events (doesPassive).
		_setupPassive();
	}

	// Make a new virtual config, which has split up selectors. We do this so we can do quick finding of event handlers and not have to iterate anything.
	_makeVirtualConfig();

	// Reset the parsed config array so it is ready for new config to be added later.
	parsedConfig = {};

	// Set up events. We can only do this after the config is fully loaded, as there could be multiple events of the same type and we need to know if they are
	// passive or not (if they use prevent-default or not).
	let evSet;
	for (evSet of preSetupEvents) {
		_setupEvent(evSet.ev, evSet.sel);
	}
	if (!selectors.click && selectors.clickoutside) {
		// Need at least one click event for clickoutside to work and there isn't one set. Set up a dummy event so it goes through the regular flow.
		_setupEvent('click', 'body');
	}
	// Clean up. If we run load-config, we'll run this function again and only attempt to add the new events loaded.
	preSetupEvents = [];

	if (!setupEnded) {
		_startMainListen();
	}

	// Put all the existing script tag details into memory so we don't load things up twice if load-script is used.
	_initScriptTrack();

	_wrapUpStart();
};
