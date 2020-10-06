_a.PreventEventDefault = o => {
	// This breaks out of the component event hierarchy once all the actions for that component have taken place.
	if (typeof o.obj == 'object') o.obj.activePrevEvDef = true;
};
