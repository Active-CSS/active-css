const _fade = o => {
	/***
	 * Work out which function called this and then call the generic function which can be kept separate to this to help split up actual functionality.
	 *
	 * fade-in *el* *duration* *displayValue*
	 * fade-out *el* *duration* [no-hide]
	 * fade-to *el* *duration* *toOpacity* *displayValue*
	 *
	 * duration = (number)(ms or s).
	 * toOpacity = (number).
	 * displayValue = optional - last value if it isn't duration or opacity - don't need to qualify it further so we keep forward compatibility.
	 * no-hide = optional - do not set the display none at the end of the fade-out.
	 * complete-then-hide = optional - do not set the display none at the end of the fade-out until the duration has completed for all in selection.
	 * el = the remainder.
	 * An easy and performant way to do this is to split o.actVal by space and work it from the back to the beginning.
	 * Last thing is to call the _fadeDo with the appropriate options.
	 *
	 * fade-in = _fadeDo(el, duration, o.func, undefined, "initial" or displayValue);
	 * fade-out = _fadeDo(el, duration, o.func);
	 * fade-to = it depends which way it is fading - see code below.
	**/

	let actValArr = o.actVal.split(' ');
	let actValArrLen = actValArr.length, i;
	let sel, duration, toOpacity, displayValue, noDisplayNone, waitDisplayNone, selArr;
	// Working backwards through the space-delimited array of the command.
	for (i = actValArrLen - 1; i > -1; i--) {
	    if (!toOpacity && _isPositiveFloat(actValArr[i])) {
		    // This is a number, which indicates it should be toOpacity.
		    if (actValArr[i] < 0 || actValArr[i] > 1) _err('Invalid fading opacity number:', o, actValArr[i]);
		    toOpacity = actValArr[i];
	    } else if (!duration && _isPositive(actValArr[i][0])) {
		    // This starts with a number so this should be the duration parameter. Display values don't start with a number.
		    duration = _convertToMS(actValArr[i], 'Invalid fading delay: ' + actValArr[i]);
		} else if (o.func == 'FadeOut' && actValArr[i] == 'no-hide') {
			noDisplayNone = true;
		} else if (o.func == 'FadeOut' && actValArr[i] == 'complete-then-hide') {
			waitDisplayNone = true;
		} else if (!displayValue && i == actValArrLen - 1) {
			// This is the last in the array (the first hit in the loop) and if it gets this far on the first iteration then it's a display value.
			displayValue = actValArr[i];
	    } else {
	    	// We can break out at this point - removing the previous items found so we can join up the rest of the array to form the selector.
	    	// it will work if the syntax is correct or it will break if the syntax is wrong.
	    	actValArr.splice(i + 1);
			// Join up what's left as this should be the selector.
			sel = actValArr.join(' ').trim();
			if (!sel) _err('Invalid fading selector:', o, sel);
	    	break;
	    }
	}

	// Set the display value if it isn't set. This won't be used for fade-out, which always ends up with a display of "none".
	if (!displayValue && o.func != 'FadeOut') displayValue = 'initial';

	let func, objs;
	if (!sel) {
		// Use the target selector if there is no selector specified.
		if (typeof o.secSelObj === 'object') objs = [ o.secSelObj ];
	} else {
		objs = _getSels(o, sel);
	}
	if (!objs) return false;	// invalid target.
	objs.forEach(function (obj) {
		func = _fadeGetFunc(obj, o.func, toOpacity, o);
		if (func) _fadeDo(obj, duration, func, toOpacity, displayValue, noDisplayNone, waitDisplayNone, o);
	});
};

const _fadeGetFunc = (el, funcIn, toOpacity, o) => {
	let funcOut = funcIn;
	let existingOpac;
	let computedStylesEl = window.getComputedStyle(el);
	if (!el.style.opacity) {
		el.style.opacity = computedStylesEl.opacity;
		existingOpac = el.style.opacity;
	}
	if (computedStylesEl.display == 'none') {
		el.style.opacity = 0;
	}
	if (funcIn == 'FadeTo') {
		let existingOpac = el.style.opacity;
		if (existingOpac > toOpacity) {
			funcOut = 'FadeOut';
		} else if (existingOpac == toOpacity) {
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
			return;
		}
	}
	return funcOut;
};

const _fadeDo = (el, duration, func, toOpac, displayValue, noDisplayNone, waitDisplayNone, o) => {
	// If this function starts getting overly complicated then split out FadeOut functionality and put into a separate function.
	// It doesn't need that level of engineering currently though as it's still maintainable and keeps the general animation all together in one place.
	var last = +new Date();
	var Tracker = last;
	var StartingLast = last;
	el._acssMidFade = Tracker;
	let computedStylesEl = window.getComputedStyle(el);
	let elStartingOpac = el.style.opacity;
	toOpac = (toOpac) ? toOpac : (func == 'FadeOut') ? 0 : 1;

	// Adjust the duration which now needs to be based on the fraction rather than 1 or 0 as we're using the time technique below.
	// The end result is the same as using a purely duration based technique.
	if (elStartingOpac != toOpac) {
		// Get the current difference between the opacities as a positive number.
		let difference = elStartingOpac > toOpac ? elStartingOpac - toOpac : toOpac - elStartingOpac;
		// Adjust the duration according to the time distance that will be travelled.
		duration = (1 / difference) * duration;
	}

	if (func != 'FadeOut') {
		if (el.style.display == 'none') {
			el.style.opacity = 0;
		}
		el.style.display = displayValue;
	}

	var tick = (timeStamp, noChange=false) => {
		// Skip out if the element is no longer on the page or if this fading event should be halted.
		if (!el || !_isConnected(el) || el._acssMidFade != Tracker) return;
		var amount = (new Date() - last) / duration;
		if (noChange !== true) el.style.opacity = (func == 'FadeOut') ? +el.style.opacity - amount : +el.style.opacity + amount;
		last = +new Date();
		if (func == 'FadeOut' && +el.style.opacity > toOpac || func != 'FadeOut' && +el.style.opacity < toOpac) {
			requestAnimationFrame(tick);
		} else if (waitDisplayNone && last - StartingLast < duration) {
			requestAnimationFrame(() => tick(undefined, true));
		} else {
			if (func == 'FadeOut' && toOpac == 0) {
				if (!noDisplayNone) el.style.display = 'none';
				el.style.opacity = 0;
			} else {
				el.style.opacity = toOpac;
			}
			delete el._acssMidFade;
			// Restart the sync queue if await was used.
			_syncRestart(o, o._subEvCo);
		}
	};

	tick();
};
