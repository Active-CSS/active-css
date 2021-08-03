_a.Exit = o => {
	// Exit out of all current loops and prevent further target running and bubbling.
	_immediateStop(o);
};
