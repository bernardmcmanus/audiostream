function AudioStream( url , options ) {

    if (!AudioContext) {
        throw new Error( 'AudioContext is not supported.' );
    }

    var that = this;
    options = options || {};

    that.loop = false;
    that.waitForLock = true;

    that.each(function( val , key ) {
        that[key] = hasOwnProperty( options , key ) ? options[key] : that[key];
    });

    that.key = NULL;
    that.context = new AudioContext();
    that.gainNode = that.context.createGain();
    that.sources = {};
    that.buffers = {};
    that[ STATE ] = 0;
    that.playstate = 0;
    that.busy = false;

    that.attemptedStart = 0;
    that.startOffset = 0;
    that.lastTime = 0;
    that.elapsed = 0;
    that._timing = bind( that._timing , that );

    MOJO.Construct( that );

    Object.defineProperties( that , {
        buffer: {
            get: function() {
                return that.buffers[that.key] || NULL;
            }
        },
        source: {
            get: function() {
                return that.sources[that.key] || NULL;
            },
            set: function( value ) {
                if (that.key) {
                    that.sources[that.key] = value || NULL;
                }
            }
        },
        volume: {
            get: function() {
                return that.gainNode.gain.value;
            },
            set: function( value ) {
                that.gainNode.gain.value = value;
            }
        },
        playable: {
            get: function() {
                return (that.source !== NULL);
            }
        },
        duration: {
            get: function() {
                return (that.playable ? that.source.buffer.duration : 0) * 1000;
            }
        },
        progress: {
            get: function() {
                return Math.round((that.elapsed / (that.duration || 1)) * 1000) / 1000;
            }
        },
        connected: {
            get: function() {
                return that[ STATE ] === STATEMAP.indexOf( 'connected' );
            }
        },
        stateText: {
            get: function() {
                return STATEMAP[that[ STATE ]];
            }
        }
    });

    that.when([ STATE_CHANGE , UNLOCK ] , that );

    if (url) {
        that.load( url );
    }
}


















