AudioStream
===========

High-level interface for the Web Audio API with compatibility hooks for iOS.

Creating an Instance
--------------------

#### new AudioStream([ url , options ])

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `url` | `String` | The stream URL | NO |
| `options` | `Object` | The options object | NO |

```javascript
// default options shown
var stream = new AudioStream( 'url' , {
  waitForLock: true,
  loop: false
});
```

Events
-------

| Event | Description | Arguments |
| ----- | ----------- | --------- |
| loading | Triggered while the XMLHttpRequest is in progress | ```progress``` |
| load | Triggered when the XMLHttpRequest is complete | n/a |
| ready | Triggered when the audio is ready to play | n/a |
| connect | Triggered when the audiobuffer is connected to the device output | n/a |
| disconnect | Triggered when the audiobuffer is disconnected to the device output | n/a |
| timing | Triggered at 60hz while audio is playing | ```elapsed```<br>```percent``` |
| start | Triggered when playback is started | ```offset``` |
| end | Triggered when playback ends | n/a |
| error | Triggered when an error occurs | ```error``` |

#### Adding and Removing Listeners
* AudioStream is built using <a href="https://github.com/elnarddogg/MOJO" target="_blank">MOJO</a>
```javascript
// listen to an event
stream.when( 'ready' , function( e ) {
  // ...
});

// listen to an event only once
stream.once( 'ready' , function( e ) {
  // ...
});

// remove an event listener
stream.dispel( 'ready' );
```

Methods
-------

#### .load([ url ])
| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `url` | `String` | The stream URL | __CONDITIONAL__ |
* `url` is optional if the stream url has already been specified.

#### .play()
```javascript
stream.play();
```

#### .pause()
```javascript
stream.pause();
```

#### .stop([ reinitialize ])
| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `reinitialize` | `Boolean` | A flag denoting whether the stream should be reinitialized automatically _(default = true)_ | NO |
* if reinitialize is false, `.load()` must be called before playing the stream again.

```javascript
stream.stop();
```

#### .destroy()
```javascript
stream.destroy();
```

