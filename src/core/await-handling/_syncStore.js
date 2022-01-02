const _syncStore = (o, delayActiveID, syncQueueSet, runButElNotThere) => {
	if (o.origLoopObj && o.origLoopObj.resume) {
		let checkObj = o.origLoopObj.resumeProps;

		// Check if we have reached the new action command that we need to resume from. We won't run this one, but we'll start from the action command after this.
		if (syncQueue[checkObj.ref_subEvCo] &&
				checkObj.intID == o.intID &&
				(typeof o.secSel == 'string' && o.secSel.startsWith('~') || checkObj.secSelObj.isSameNode(o.secSelObj)) &&
				checkObj.loopRef == o.loopRef) {

			// Don't run this command but let it run the next time.
			_syncEmpty(checkObj.ref_subEvCo);
			// This is not needed for the flow but makes things faster:
			delete o.origLoopObj;
			return true;
		}
	}

	// If we need to skip this action command altogether, return true.
	if (!delayActiveID && syncQueueSet) return true;
};
