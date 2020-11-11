// Just need to make this test successful, so we can just replace the native alert call with a success updater.
// Alert should only need to be tested once in the tests. Active CSS shouldn't *ever* produce any alert notifications.
window.alert = function(idToMarkSuccessFul) {
	// Out of scope of everything so need to do a manual update on the test element.
	let el = document.getElementById(idToMarkSuccessFul);
	el.classList.add('success');
};
