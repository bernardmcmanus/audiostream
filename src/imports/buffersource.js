function BufferSource( url , autoload ) {

    var that = this;
    that.url = url;
    that.data = NULL;

    autoload = (isBoolean( autoload ) ? autoload : true);

    MOJO.Construct( that );

    Object.defineProperty( that , READY , {
        get: function() {
            return that.data !== NULL;
        }
    });

    that._readystatechange = bind( that._readystatechange , that );
    that._progress = bind( that._progress , that );
    that._error = bind( that._error , that );

    if (autoload) {
        that.load( url );
    }
}


BufferSource[PROTOTYPE] = MOJO.Create({

    _readystatechange: function( e ) {

        var that = this;
        var request = e.target;

        if (request.readyState != request.DONE) {
            return;
        }

        var response = request.response;

        if (request.status == 200 && isArrayBuffer( response )) {
            that.data = response;
            that.happen( LOAD , response );
        }
        else {
            request.onerror();
        }
    },

    _progress: function( e ) {
        var that = this;
        if (e.total) {
            that.happen( LOADING , ( e.loaded / e.total ));
        }
    },

    _error: function( e ) {
        var that = this;
        that.happen( ERROR , new Error( 'Error loading sound.' ));
    },

    load: function( url ) {

        var that = this;

        if (that.ready && (!url || url === that.url)) {
            that.happen( LOAD , that.data );
        }
        else {

            url = (that.url = url || that.url);

            if (url) {

                ajax({
                    url: url,
                    responseType: 'arraybuffer',
                    onreadystatechange: that._readystatechange,
                    onprogress: that._progress,
                    onerror: that._error
                });
            }
        }

        return that;
    },

    destroy: function( reallyDestroy ) {
        var that = this;
        that.data = NULL;
        if (reallyDestroy) {
            that.url = NULL;
            that.dispel();
        }
    }
});

















