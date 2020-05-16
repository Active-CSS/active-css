_c.IfScrolltopGreater = o => {
	if (o.obj == 'body') {
		return (window.pageYOffset || document.documentElement.scrollTop) > o.actVal;
	} else {
		return o.obj.scrollTop > o.actVal;
	}
};
