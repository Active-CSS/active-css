const _syncCheckAndSet = (o, syncQueueSet) => {
	// If there isn't a sync option on the command, skip it.
	if (!o.actVal.endsWith(' await')) return;

	// Remove the " sync" from action command.
	o.actVal = o.actVal.slice(0, -6).trim();

	// Only sync this command if it's a valid delayed event, otherwise ignore the sync.
	if (!o.isAsync && !o.isTimed) return;
	// Set the sync queue up for remaining action commands to be added.

	// We are awaiting here. Set the resumption object so we can remember where to resume from later.
	_setResumeObj(o);
	_immediateStop(o);

	// No return value is needed as objects are passed into functions by reference.
};
