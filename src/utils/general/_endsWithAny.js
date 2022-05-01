const _endsWithAny = (arr, str) => {
    let item;
    for (item of arr) {
        if (str.endsWith(item)) return true;
    }
};
