/*
<img id="checkLoadImagesImg1" src="/base/core-test-area/tests/resource-files/tiny.png" data-lazy-image="/base/core-test-area/tests/resource-files/cat3.gif" alt="">
<picture>
    <source id="checkLoadImagesPicSrc1" srcset="/base/core-test-area/tests/resource-files/tiny.png" data-lazy-image="/base/core-test-area/tests/resource-files/building-cliff-clouds-67235-tn.jpg" media="(min-width: 800px)">
    <img id="checkLoadImagesImg2" src="/base/core-test-area/tests/resource-files/tiny.png" data-lazy-image="/base/core-test-area/tests/resource-files/cat2.gif" />
</picture>
*/

function checkLoadImages(o) {
	let testEl = _initTest('checkLoadImages');
	if (!testEl) return;

	let el1 = _getObj('#checkLoadImagesImg1');
	let el2 = _getObj('#checkLoadImagesPicSrc1');
	let el3 = _getObj('#checkLoadImagesImg2');

	if (!el1 || !el2 || !el3) {
		_fail(testEl, 'Image elements failed to load prior to test.');

	} else {
		if (_getFileName(el1.src) !== 'cat3.gif') {
			_fail(testEl, '#checkLoadImagesImg1 did not contain the lazy-loaded image. el1.src:', el1.src);
		}
		if (_getFileName(el2.srcset) !== 'building-cliff-clouds-67235-tn.jpg') {
			_fail(testEl, '#checkLoadImagesPicSrc1 did not contain the lazy-loaded image. el2.srcset:', el2.srcset);
		}
		if (_getFileName(el3.src) !== 'cat2.gif') {
			_fail(testEl, '#checkLoadImagesImg2 did not contain the lazy-loaded image. el3.src:', el3.src);
		}

		_addSuccessClass(testEl);
	}
}
