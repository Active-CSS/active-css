ActiveCSS._hasSetupEnded = () => {
	// This is called from the extensions. Otherwise, this function would, indeed, be quite pointless.
	return setupEnded;
};
