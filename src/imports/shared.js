function ajax( options ) {

    options = options || {};

    var url = options.url;
    var method = hasOwnProperty( options , 'method' ) ? options.method : 'GET';
    var async = hasOwnProperty( options , 'async' ) ? options.async : true;
    var request = new XMLHttpRequest();

    for (var key in options) {
        if (hasOwnProperty( request , key )) {
            request[key] = options[key];
        }
    }

    request.open( method , url , async );
    request.send();
}


function now() {
    return performance.now();
}


function ensureFunction( subject ) {
    return subject || function() {};
}


function async( handler , delay ) {
    setTimeout( handler , ( delay || 1 ));
}


function bind( method , subject ) {
    return method.bind( subject );
}


function hasOwnProperty( subject , key ) {
    return subject.hasOwnProperty( key );
}


function isBoolean( subject ) {
    return typeof subject === 'boolean';
}


function isNumber( subject ) {
    return typeof subject === 'number' && !isNaN( subject );
}


function isArrayBuffer( subject ) {
    return subject instanceof ArrayBuffer;
}


function addEventListener( subject , event , handler ) {
    subject.addEventListener( event , handler );
}


function removeEventListener( subject , event , handler ) {
    subject.removeEventListener( event , handler );
}











    