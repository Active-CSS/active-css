const _isPendingAjaxForComponents = obj => {
	return obj.classList.contains('htmlPending') || obj.classList.contains('cssPending') || obj.classList.contains('jsonPending');
};
