const _clearTimeouts = delayID => {
	// Note: In Active CSS it is impossible to have an "after" delay and an "every" interval happening at the same
	// time. "After" delays always come before "every" intervals. When removing timeouts or intervals there should never be a clash in numbers as setInterval and
	// setTimeout should share the same pool of IDs in browsers, or at least they are supposed to :) Distinction clarity in the use case here is not helpful, as it
	// means adding unnecessary code. This is not good practice if it isn't needed. Unless things are likely to change in the future due to the same pool not being
	// part of the W3C spec, but it is *implied, just about* in the spec that they share the same pool, so it should be ok.
	clearTimeout(delayID);
	clearInterval(delayID);
	_syncEmpty(delaySync[delayID]);
	delete delaySync[delayID];
};
