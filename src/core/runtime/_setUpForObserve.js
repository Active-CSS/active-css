const _setUpForObserve = (useForObserveID, useForObservePrim, condClause) => {
	if (elObserveTrack[useForObserveID] === undefined) elObserveTrack[useForObserveID] = [];
	if (elObserveTrack[useForObserveID][useForObservePrim] === undefined) elObserveTrack[useForObserveID][useForObservePrim] = {};
	if (elObserveTrack[useForObserveID][useForObservePrim][condClause] === undefined) elObserveTrack[useForObserveID][useForObservePrim][condClause] = {};
};
