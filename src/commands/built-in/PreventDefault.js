_a.PreventDefault = o => {
	if (o.e) o.e.preventDefault();	// Sometimes will get activated on a browser back-arrow, etc., so check first.
};
