const _syncEmpty = val => {
	// Wipe this sync queue. The "i" is needed at the beginning of each key in order to get the delete working correctly. Otherwise you'll get a memory leak.
	// But it's super fast this way.
	delete syncQueue[val];
};
