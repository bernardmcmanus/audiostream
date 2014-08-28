AudioStream.isIos = function() {
    return (/(ipad|iphone|ipod)/i).test( navigator.userAgent );
};