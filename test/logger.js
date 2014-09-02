window.logger = (function() {

    
    function Logger( selector ) {

        var that = this;

        that.maxlines = 100;
        that.element = document.querySelector( selector );
        that.inner = that.element.children[0];
        CSS( that.element , LoggerStyle );

        window.onerror = window.onerror || function( msg ) {
            that.puts( msg );
        };

        that.element.addEventListener( 'contextmenu' , clear );
        that.element.addEventListener( 'touchstart' , clear );

        var tol = 200;
        var timestamp = 0;

        function clear( e ) {
            e.preventDefault();
            if (e.type === 'contextmenu') {
                that.clear();
            }
            if (e.type === 'touchstart') {
                if (e.timeStamp - timestamp < tol) {
                    timestamp = 0;
                    that.clear();
                }
                timestamp = e.timeStamp;
            }
        }
    }


    Logger.prototype = {

        puts: function( msgs , css ) {
          
            var that = this;
            var inner = that.inner;
            var line = document.createElement( 'span' );

            var str = ensureArray( msgs )
                .map(function( msg ) {
                    var out;
                    try {
                        if (typeof msg === 'object') {
                            out = JSON.stringify( msg );
                        }
                        else {
                            out = msg.toString();
                        }
                    }
                    catch( err ){
                        out = msg.valueOf();
                    }
                    return out;
                })
                .join( '&nbsp;' );

            line.innerHTML = str;
            CSS( line , LineStyle );
            CSS( line , ( css || {} ));

            that.inner.appendChild( line );

            that._limitLines();

            that.element.scrollTop = inner.getBoundingClientRect().height;
        },

        comment: function( msg ) {
            var that = this;
            that.puts(( '//&nbsp;' + msg ), {
                color: 'gray'
            });
        },

        clear: function() {
            this.inner.innerHTML = '';
        },

        _limitLines: function() {
            var that = this;
            var inner = that.inner;
            var max = that.maxlines;
            var children = inner.children;
            while (children.length > max) {
                inner.removeChild( children[0] );
            }
        }
    };


    var LoggerStyle = {
        'padding' : '10px',
        'background-color': 'rgba(255,255,255,0.1)'
    };


    var LineStyle = {
        'font-family': 'Monaco, Menlo, Consolas, \'Courier New\', monospace',
        'display': 'block'
    };


    function CSS( element , styleObj ) {

        var that = this;

        forEach( styleObj , function( key ) {
            var property = camel( key );
            var value = styleObj[key];
            applyStyle( property , value );
        });

        function applyStyle( property , value ) {
            element.style[ property ] = value;
        }
    }


    function ensureArray( subject ) {
        return (subject instanceof Array ? subject : [ subject ]);
    }


    function camel( str ) { 
        return str
        .toLowerCase()
        .replace( /-(.)/g , function( match , group ) {
            return group.toUpperCase();
        });
    }


    function forEach( subject , iterator ) {
        Object.keys( subject ).forEach( iterator );
    }


    return new Logger( '#logger' );


}());




















