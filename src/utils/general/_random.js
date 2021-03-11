const _random = (len, str=false) => {
	let chars = (str) ? RANDCHARS + RANDNUMS : RANDNUMS, rand = '', i = 0;
    for (i = 0; i < len; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
	return rand;
};
