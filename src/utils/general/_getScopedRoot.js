const _getScopedRoot = (obj) => {
	return (obj.parentNode) ? obj.parentNode.closest('[data-active-scoped]') : null;		// Should return null if no closest scoped component found.
};
