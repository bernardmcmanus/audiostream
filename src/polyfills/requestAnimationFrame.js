window.requestAnimationFrame = (function( window , performance , setTimeout , clearTimeout ) {


    var name = 'equestAnimationFrame';
    var initTime = performance.now();


    function timestamp() {
        return performance.now() - initTime;
    }
    
    
    return (
        window['r' + name] ||
        window['webkitR' + name] ||
        window['mozR' + name] ||
        window['oR' + name] ||
        window['msR' + name] ||
        function( callback ) {
            var timeout = setTimeout(function() {
                callback( timestamp() );
                clearTimeout( timeout );
            }, ( 1000 / 60 ));
        }
    );

    
}( window , performance , setTimeout , clearTimeout ));