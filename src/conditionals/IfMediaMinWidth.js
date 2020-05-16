_c.IfMediaMinWidth = o => {
	// This could get stored in a variable with an event listener rather than running each time. Probably not worth the overhead though.
	let mq = window.matchMedia('all and (min-width: ' + o.actVal + ')');
	return mq.matches;
};
