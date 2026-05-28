function getNoteFromFreq(freq) {
    const n = 12 * Math.log2(freq / 440) + 69;
    return Math.round(n);
}

export  {
    getNoteFromFreq
}