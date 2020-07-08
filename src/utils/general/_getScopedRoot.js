const _getScopedRoot = (obj) => {
	return obj.closest('[data-active-scoped]');		// Should return null if no closest scoped component found.
};
