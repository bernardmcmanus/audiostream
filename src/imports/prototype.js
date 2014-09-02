AudioStream[PROTOTYPE] = MOJO.Create({

    load: function( url , key , callback ) {

        key = key || 'main';
        callback = ensureFunction( callback );

        var that = this;
        var buffers = that.buffers;
        var bufferSource = buffers[key];
        var isNewBufferSource = !(bufferSource instanceof BufferSource);

        that.busy = true;
        that.key = key;

        bufferSource = bufferSource || new BufferSource( url , false );
        bufferSource.once( LOAD , callback );

        if (isNewBufferSource) {

            // create a new BufferSource

            that.started = false;
            that.locked = true;
            that._setState( 0 );
            
            bufferSource
                .when( LOADING , function( e , percent ) {
                    that.happen( LOADING , percent );
                })
                .when( LOAD , function( e , data ) {
                    var state = that.state;
                    that._setState( 1 );
                    that._initialize( data , function() {
                        that.busy = false;
                        that._unlock();
                    });
                })
                .when( ERROR , function( e , error ) {
                    that.destroy( true );
                    that.happen( ERROR , error );
                    callback( false );
                })
                .load();

            buffers[key] = bufferSource;
        }
        else {

            // otherwise, initialize the existing BufferSource

            that.started = true;
            that.locked = false;

            bufferSource.load( url );
        }

        return that;
    },

    _initialize: function( data , callback ) {

        var that = this;
        var context = that.context;
        var source = that.source || context.createBufferSource();

        context.decodeAudioData( data , function( buffer ) {
            source.buffer = buffer;
            source.loop = that.loop;
            source.onended = function( e ) {
                that.happen( END );
                that.stop();
            };
            that._setState( 2 );
            callback();
        });

        that.source = source;
    },

    unlock: function() {
        var that = this;
        if (that.locked) {
            that.locked = false;
            that.happen( UNLOCK );
        }
    },

    _unlock: function() {

        var that = this;
        var touchstart = 'touchstart';
        var touchmove = 'touchmove';

        if (AudioStream.isIos() && that.locked) {
            addEventListener( window , touchstart , interaction );
            addEventListener( window , touchmove , interaction );
        }
        else {
            that.unlock();
        }

        function interaction( e ) {
            if (that.playable) {
                that.unlock();
                removeEventListener( window , touchstart , interaction );
                removeEventListener( window , touchmove , interaction );
            }
        }
    },

    _setState: function( state ) {
        var that = this;
        if (state !== that[ STATE ]) {
            that[ STATE ] = state;
            that.happen( STATE_CHANGE , [ state , STATEMAP[state] ]);
        }
    },

    handleMOJO: function( e ) {

        var that = this;
        var args = arguments;
        var state;

        switch (e.type) {

            case UNLOCK:
                if (that.waitForLock) {
                    that.start( 0 , 0 );
                }
                else {
                    that.start();
                }
            break;

            case STATE_CHANGE:

                state = args[1];

                switch (state) {

                    case 1:
                        that.happen( LOAD );
                    break;

                    case 2:
                        that.happen( READY );
                        if (that.attemptedStart) {
                            async(function() {
                                that.play();
                            });
                        }
                    break;

                    case 3:
                        that.happen( CONNECT , that.startOffset );
                    break;

                    case 4:
                        that.happen( DISCONNECT , that.playstate );
                    break;
                }
            break;
        }
    },

    connect: function() {
        var that = this;
        var source = that.source;
        var context = that.context;
        if (that.playable && !that.connected) {
            source.connect( context.destination );
            that._setState( 3 );
            that._startTimer();
        }
    },

    disconnect: function() {
        var that = this;
        var source = that.source;
        if (that.playable && that.connected) {
            that.startOffset = 0;
            source.disconnect( 0 );
            that._setState( 4 );
            that._stopTimer();
        }
    },

    _startTimer: function() {
        var that = this;
        that.timerLoop = true;
        requestAnimationFrame( that._timing );
    },

    _stopTimer: function() {
        var that = this;
        var diff = (now() - that.lastTime);
        that.elapsed += (diff > 0 ? diff : 0);
        that.timerLoop = false;
    },

    _timing: function( timestamp ) {
        var that = this;
        if (that.timerLoop) {
            if (that.connected && (!that.locked || !that.waitForLock)) {
                that.elapsed += (timestamp - (that.lastTime || timestamp));
                that.happen( TIMING , [ that.elapsed , that.progress , timestamp ]);
            }
            that.lastTime = timestamp;
            requestAnimationFrame( that._timing );
        }
        else {
            that.lastTime = 0;
        }
    },

    _getStartArgs: function( when , offset , duration ) {

        var that = this;

        when = (isNumber( when ) ? when : 0);
        offset = isNumber( offset ) ? offset : that.elapsed;
        duration = (isNumber( duration ) ? duration : (that.duration - offset)) / 1000;
        offset /= 1000;

        return [ when , offset , duration ];
    },

    start: function( when , offset , duration ) {

        var that = this;

        if (that.playable) {
            
            var source = that.source;

            if (!that.locked) {

                var args = that._getStartArgs( when , offset , duration );

                if (!that.started) {
                    source.start.apply( source , args );
                }

                if (that.playstate === 1) {
                    that.startOffset = (args[1] * 1000);
                    that.happen( START , that.startOffset );
                    that.playstate = 2;
                }

                that.started = true;
            }
        }
    },

    // -------------------- INTERFACE --------------------

    play: function() {
        
        var that = this;

        if (that.busy) {
            that.attemptedStart = now();
        }
        else if (that.state === 0) {
            that.load( NULL , NULL , function() {
                that.attemptedStart = now();
            });
        }
        else if (!that.playstate) {
            that.playstate = 1;
            var offset = that.attemptedStart ? (now() - that.attemptedStart) : NULL;
            that.start( NULL , offset , NULL );
            that.connect();
        }
        else {
            that.connect();
        }

        return that;
    },

    pause: function() {
        var that = this;
        that.disconnect();
        return that;
    },

    stop: function( reinitialize ) {

        var that = this;

        if (that.playstate) {

            reinitialize = isBoolean( reinitialize ) ? reinitialize : true;

            that.playstate = 0;
            that.disconnect();

            that.elapsed = 0;
            that.attemptedStart = 0;
            that.startOffset = 0;

            if (reinitialize) {
                that.load();
            }
            else {
                that.destroy();
            }
        }

        return that;
    },

    destroy: function( key ) {

        var that = this;
        var sources = that.sources;
        var buffers = that.buffers;
        var destroyKey = key || that.key;
        var bufferSource = buffers[destroyKey] || new BufferSource( NULL , false );

        that.attemptedStart = 0;
        that.startOffset = 0;

        if (key === that.key) {
            bufferSource.destroy( true );
            delete sources[key];
            delete buffers[key];
            that.key = NULL;
        }
        else {
            bufferSource.destroy();
        }

        that._setState( 0 );

        return that;
    }
});


















