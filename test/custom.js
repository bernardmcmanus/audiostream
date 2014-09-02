(function() {

    var count = 0;
    var AudioURL = 'audio/big_buck_bunny.' + (AudioStream.isIos() ? 'm4a' : 'mp3') + '?r=' + Date.now();

    var stream = new AudioStream( AudioURL , {
        //waitForLock: false
    })
    .once( 'ready' , function( e ) {
        //stream.play();
    })
    .when( 'loading' , function( e , progress ) {
        logger.puts([ 'loading' , progress ]);
        console.log(e.type,arguments);
    })
    .when( 'load' , function( e ) {
        logger.puts( e.type );
        console.log(e.type,arguments);
    })
    .when( 'ready' , function( e ) {
        logger.puts( e.type );
        console.log(e.type,arguments);
        count++;
        logger.puts('Audio initialized ' + count + ' times.');
        console.log('Audio initialized ' + count + ' times.');
    })
    .when( 'unlock' , function( e ) {
        logger.puts('UNLOCK');
        console.log('UNLOCK');
    })
    .when( 'connect' , function( e ) {
        logger.puts( e.type );
        console.log(e.type,arguments);
    })
    .when( 'disconnect' , function( e , playstate ) {
        logger.puts([ e.type , playstate ]);
        console.log(e.type,playstate);
    })
    .when( 'timing' , function( e , elapsed , percent ) {
        logger.puts([Math.round(elapsed),percent]);
        //console.log(Math.round(elapsed),percent);
    })
    .when( 'start' , function( e , offset ) {
        logger.puts([e.type,offset]);
        console.log(e.type,offset);
    })
    .when( 'end' , function( e ) {
        logger.puts( e.type );
        console.log(e.type,arguments);
    })
    .when( 'statechange' , function( e , state , text ) {
        logger.puts([stream.state,state,text]);
        console.log(stream.state,state,text);
    })
    .when( 'error' , function( e ) {
        logger.puts( e.type );
        console.log(e.type,arguments);
    });

    //stream.play();

    console.log(stream);


    var play = document.querySelector( '#play' );
    var stop = document.querySelector( '#stop' );
    var pause = document.querySelector( '#pause' );


    play.addEventListener( 'click' , function( e ) {
        stream.play();
    });

    stop.addEventListener( 'click' , function( e ) {
        stream.stop();
    });

    pause.addEventListener( 'click' , function( e ) {
        stream.pause();
    });

}());




















