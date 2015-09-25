(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// base.js
exports = module.exports = {}


var log = require( './log.js' )


// any important definitions for base module go here
exports.content = document.getElementById( 'content' )
exports.socket = null
var curtain = null

exports.init = function() {
  
  // intitialize sockets !CHANGE!-env dep
  //var socket = io.connect( 'https://face-app-jlouis.c9.io' )
  //var socket = io.connect( 'face-app.herokuapp.com' )
  //exports.socket = io.connect( window.location.href + 'nsp' )
  exports.socket = io.connect( '/nsp' ) /*global io*/
  //var socket = io.connect( 'https://face-app-jlouis.c9.io' )
  
  exports.socket.on( 'connect', function() {
    // do all things we do when we connect...
    log.debug( 'client has connected to server.' )
  } )
  
  exports.socket.on( 'disconnect', function() {
    // do all things we do when we disconnect...
    log.debug( 'client has disconnected from server.' )
  } )

  // more or less damage control designed to look like nice loading screen
  // (adding the curtain to the DOM is not done dynamically to ensure that it is
  // already there before user can mess stuff up)
  curtain = document.getElementById( 'loadingCurtain' )
  
  log.debug( 'base.js initialized.' )
}

exports.hideCurtain = function() {
   curtain.style.visibility = 'hidden'
   curtain.style.opacity = 0
}

exports.showCurtain = function() {
   curtain.style.visibility = 'visible'
   curtain.style.opacity = 1
}

},{"./log.js":5}],2:[function(require,module,exports){
// chatRoulette.js
exports = module.exports = {}
exports.version = '1.0'


var log = require( './log.js' )
var controls = require( './controls.js' )


// define any random-stranger-video-chat-related stuff here
var chatRouletteControl = null

exports.init = function() {

  createChatRouletteControl()
  
  log.debug( 'chatRoulette.js initialized.' )
  
}

function createChatRouletteControl() {
  chatRouletteControl = controls.add( 'push', chatRoulette, 'chatRouletteControl', '&phone;' )
}

function chatRoulette() {
  log.debug( 'chatRoulette has not yet been implemented' )
}


},{"./controls.js":3,"./log.js":5}],3:[function(require,module,exports){
// controls.js
exports = module.exports = {}
exports.version = '1.0'


var base = require( './base.js' )
var log = require( './log.js' )


// initialize controls overlay related components
exports.controlsStack = []
var baseOpacity = 0.65
var containerDiv = null


exports.init = function() {

  createControlsEle( base.content )
  
  exports.fadeIn()
  
  log.debug( 'controls.js initialized.' )
  
}

exports.add = function( type, action, id, icon ) {
  
  if ( containerDiv === null ) {
    log.debug( 'cannot add control: controlsContainer not yet intialized ')
    return
  }
  
  // create container element for container
  var controlDiv = document.createElement( 'nav' )
  controlDiv.setAttribute( 'id', id )
  controlDiv.classList.add( 'baseButton' )
  
  // add anything to the inside of the control container
  if ( typeof icon === 'string' || icon instanceof String ) {
    controlDiv.classList.add( 'asciiButton' )
    controlDiv.innerHTML = icon
  }
  
  // attach action to control
  if ( type == 'push' ) {
    controlDiv.addEventListener( 'click', action, false )
  } else if ( type == 'toggle' ) {
    controlDiv.state = false
    controlDiv.addEventListener( 'click', function() {
      if ( controlDiv.state ) {
        action[1]()
        controlDiv.state = false
      } else {
        action[0]()
        controlDiv.state = true
      }
    }, false )
  } else {
    log.debug( 'unknow control type: cannot add control' )
  }
  
  // keep track of controls
  exports.controlsStack.push( controlDiv )
  
  // add control to DOM
  containerDiv.appendChild( controlDiv )
  
  return controlDiv
}

exports.remove = function( id ) {
  
  log.debug( 'remove control function not yet implemented' )
  
}

function createControlsEle( parentEle ) {
  // creating the DOM elements dynamically allows us to use node modules 
  // modularly in a way that allows specific features to be used or not used 
  // nicely
  
  // create container element for controls overlay
  containerDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'controlsContainer' )
  containerDiv.classList.add( 'controlsContainer' )
  containerDiv.classList.add( 'noSelect' )
  
  // add to DOM
  parentEle.appendChild( containerDiv )
  
}

exports.fadeIn = function() {
  containerDiv.style.visibility = 'visible'
  containerDiv.style.opacity = baseOpacity
}

exports.fadeOut = function() {
  containerDiv.style.visibility = 'hidden'
  containerDiv.style.opacity = 0
}

exports.fadeInControl = function( controlDiv ) {
  controlDiv.style.display = 'inherit'
  controlDiv.style.visibility = 'visible'
  controlDiv.style.opacity = baseOpacity
}

exports.fadeOutControl = function( controlDiv ) {
  controlDiv.style.display = 'none'
  controlDiv.style.visibility = 'hidden'
  controlDiv.style.opacity = 0
}

},{"./base.js":1,"./log.js":5}],4:[function(require,module,exports){
// faceBase.js
exports = module.exports = {}


var base = require( './base.js' )
var log = require( './log.js' )
var controls = require( './controls.js' )
var video = require( './video.js' )
var snapshot = require( './snapshot.js' )


// define any face action stuff here ;)
var toggleFaceControl = null


exports.init = function () {
  
  createToggleFaceControl()
  
  // initialize any socket events...
  
  base.socket.on( 'getFaceRes', function( data ) {
    video.overlay.clear()
    for ( var idx=0; idx<data.matches.length; ++idx ) {
      video.overlay.drawRect( 
        data.matches[idx].x, data.matches[idx].y, 
        data.matches[idx].width, data.matches[idx].height,
        snapshot.snapshotScaleFactor )
    }
    log.debug( data.matches )
    if ( toggleFaceControl.state ) {
      setTimeout( exports.getFace, 10 )
      //faceFpsUpdate.faceFpsFrames++
    } else {
      setTimeout( video.overlay.clear, 500 )
    }
  } )

  log.debug( 'faceBase.js initialized.' )
  
}

exports.getFace = function() {
  
  // get image buffer
  var imgBuffer = snapshot.snapchatMinusTheChat( 
    snapshot.snapshotCanvas, 
    snapshot.snapshotCtx 
    )
  
  base.socket.emit( 'getFace', { 
    width: snapshot.snapshotCanvas.width, 
    height: snapshot.snapshotCanvas.height, 
    buf: imgBuffer } )
    
}

/*
var toggleFaceFlag = false
faceFpsUpdate.faceFpsFrames = 0
faceFpsUpdate.faceFpsTick = -9e10
function faceFpsUpdate() {
  this.faceFps = faceFpsUpdate.faceFpsFrames / ( performance.now() - this.faceFpsTick ) * 1000
  toggleFaceButton.innerHTML = this.faceFps.toFixed( 0 ).toString() + ' fps'
  
  // reset fps variables
  faceFpsUpdate.faceFpsFrames = 0
  this.faceFpsTick = performance.now()
}
*/
function toggleFaceOn() {
  
  // update fps
  //this.fpsLis = setInterval( faceFpsUpdate, 1000 )
  
  // run procedure
  //this.faceLis = setInterval( getFace, 10 )
  exports.getFace()
}

function toggleFaceOff() {
  
  // clear any drawings
  video.overlay.clear()
  
  // stop fps and reset button label
  //clearInterval( this.fpsLis )
  
}




function createToggleFaceControl( parentEle ) {
  toggleFaceControl = controls.add( 'toggle', [ toggleFaceOn, toggleFaceOff ], 'getFaceControl', '&female;' )
}









/*

  var socket = io.connect(top.location.origin); // 'http://localhost');
  socket.on('caras', function (_caras) {
    // console.log(_caras)
    if (!_caras || _caras.length === 0) {
    if (++noDetectadas > 10) {
      noDetectadas = 0;
      caras = [];
    }
    return;
    }
    caras = _caras;
    if (debugBtn.className == 'round alert') {
    debug.innerHTML = JSON.stringify({fps:fps, caras: { total: caras.length, data: caras}});
    }
    //// Intenta Quitar el tembeleque
    // caras = _caras.map(function (cara) {
    //   cara.x = Math.floor(cara.x / 10) * 10;
    //   cara.y = Math.floor(cara.y / 10) * 10;
    //   cara.width = Math.floor(cara.width / 20) * 20;
    //   cara.height = Math.floor(cara.height / 20) * 20;
    //   return cara;
    // });
  }).on('disconnect', function (data) {
    console.log("Disconnected!!!", data);
  });

  function captura () {    
    mainTimer = setInterval(function () {
    ctx.drawImage(video, 0, 0, 320, 240);
    if (caras && caras.length) {
      divCaras.innerHTML = '';
      for (var i in caras) {
      var cara = caras[i];
      var _cara = document.createElement('canvas');
      // Fotica por individuo
      divCaras.appendChild(_cara);
      _cara.width = 64;
      _cara.height = 64;
      _cara.getContext('2d').drawImage(canvas, cara.x, cara.y, cara.width, cara.height, 0, 0, 64, 64);

      // Marco de Cara
      ctx.beginPath();
      ctx.rect(cara.x, cara.y, cara.width, cara.height);
      ctx.fillStyle = 'rgba(46, 166, 203, 0.5)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2ba6cb';
      ctx.stroke();
      // Marco de ojos
      if (cara.ojos) {
        for (var ojo in cara.ojos) {
        ojo = cara.ojos[ojo];
        ctx.beginPath();
        ctx.rect(ojo.x, ojo.y, ojo.width, ojo.height);
        ctx.fillStyle = 'transparent';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        }
      }
      }
    }
    socket.emit('frame', canvas.toDataURL("image/jpeg"));
    }, 1000 / fps);
  }
  captura();
  
*/



},{"./base.js":1,"./controls.js":3,"./log.js":5,"./snapshot.js":8,"./video.js":9}],5:[function(require,module,exports){
// log.js
exports = module.exports = {}
exports.version = '1.0'


var base = require( './base.js' )


// initialize log overlay related components
exports.logStack = []
exports.debugStack = []
var fadeDur = 15  //seconds
var baseOpacity = 0.65
var containerDiv = null
var contentsDiv = null


exports.init = function() {

  createLogEle( base.content )
  
  exports.debug( 'log.js initialized.' )
  
}

exports.debug = function( string ) {
  // log the information prettily if the DOM already has the debug stuff
  // initialized
  
  if ( contentsDiv ) {
    
    // create debug text element
    var debugEle = document.createElement( 'div' )
    debugEle.classList.add( 'logOverlayElement' )
    debugEle.innerHTML = string
    
    // add debug element to log container contents
    exports.fadeIn()
    contentsDiv.insertBefore( debugEle, exports.logStack[0] )
  
    // keep track of debug elements and all logs
    exports.debugStack.unshift( debugEle )
    exports.logStack.unshift( debugEle )
    
    // set action to remove element from debug container
    setTimeout( function() {
      contentsDiv.removeChild( exports.logStack.pop() )
      if ( !exports.logStack.length ) exports.fadeOut()
    }, fadeDur*1000 )
    
  }
  
  // it would be unfair to leave the old console out
  console.log( string )
  
}

function createLogEle( parentEle ) {
  // creating the DOM elements dynamically allows us to use node modules 
  // modularly in a way that allows specific features to be used or not used 
  // nicely
  
  // create container element for log overlay
  containerDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'logContainerDiv' )
  containerDiv.classList.add( 'logOverlayContainer' )
  
  // we need another container to hold the actual log elements
  contentsDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'logContentsDiv' )
  contentsDiv.classList.add( 'logOverlayContents' )
  containerDiv.appendChild( contentsDiv )
  
  // add to DOM
  parentEle.appendChild( containerDiv )
  
}

exports.fadeIn = function() {
  containerDiv.style.visibility = 'visible'
  containerDiv.style.opacity = baseOpacity
}

exports.fadeOut = function() {
  containerDiv.style.visibility = 'hidden'
  containerDiv.style.opacity = 0
}


},{"./base.js":1}],6:[function(require,module,exports){
// main.js

var base = require( './base.js' )
var log = require( './log.js' )
var controls = require( './controls.js' )
var chatRoulette = require( './chatRoulette.js' )
var punkCounter = require( './punkCounter.js' )
var video = require( './video.js' )
var snapshot = require( './snapshot.js' )
var faceBase = require( './faceBase.js' )


function init() {
  
  log.debug( 'Initializing . . .' )
  
  // back to basic b*@%&#s
  base.init()
  //base.hideCurtain()
  // initialize debug container so we can have nice debugging in our face 
  // (removing this for production will still allow all debug messages to be sent
  // to the console) (good to do this early so we get nice debugging to the 
  // screen)
  log.init()
  
  // initialize control container for a responsive controls template which can 
  // be utilized by other modules to add/remove controls and such (good to do
  // this early so that any following modules can instantiate controls they need
  // immediately)
  controls.init()
  
  // it would be nice to be notified of additonal user of the app and be able to
  // store relevant information about those who are connected and if they 
  // disconnect
  punkCounter.init()
  
  chatRoulette.init()
  
  video.init()
  
  snapshot.init()
  
  faceBase.init()
  
}

// go!
init()


},{"./base.js":1,"./chatRoulette.js":2,"./controls.js":3,"./faceBase.js":4,"./log.js":5,"./punkCounter.js":7,"./snapshot.js":8,"./video.js":9}],7:[function(require,module,exports){
// punkCounter.js
exports = module.exports = {}


var base = require( './base.js' )
var log = require( './log.js' )


exports.init = function() {

  // initialize any socket events...

  base.socket.on( 'punkCounterPlusEvt', function ( data ) {
    // tells users who is new
    log.debug( 'Added: ' + data.user )
    log.debug( 'Punk Count is now at ' + data.count )
  } )
  
  base.socket.on( 'punkCounterMinusEvt', function ( data ) {
    // tells users who is new
    log.debug( 'Lost: ' + data.user )
    log.debug( 'Punk Count is now at ' + data.count )
  } )
  
  log.debug( 'punkCounter.js initialized.' )
  
}

},{"./base.js":1,"./log.js":5}],8:[function(require,module,exports){
// snapshot.js
exports = module.exports = {}

var base = require( './base.js' )
var log = require( './log.js' )
var video = require( './video.js' )


// initialize snapshot/display canvas related components
exports.snapshotCanvas = null
exports.snapshotCtx = null
exports.displayCanvas = null
exports.displayCtx = null
exports.snapshotScaleFactor = 0.5
var fadeCanvasIn = 3 // seconds
var baseCanvasOpacity = 0.85


exports.init = function () {
  
  createSnapshotEle( base.content )
  //createDisplayEle( base.content )
  
  log.debug( 'snapshot.js initialized.' )
  
}


exports.snapchatMinusTheChat = function( canvas, ctx ) {
  if ( video.curStream ) {
    resizeCanvas( canvas )
    ctx.drawImage( video.mainVideo, 0, 0, canvas.width, canvas.height )
    return canvas.toDataURL()
  } else {
    log.debug( 'no stream to snapchat minus the chat to.' )
    return null
  }
}

function resizeCanvas( canvas ) {
  canvas.width = video.mainVideo.videoWidth * exports.snapshotScaleFactor
  canvas.height = video.mainVideo.videoHeight * exports.snapshotScaleFactor
}

function saveSnapshotToServer( dataUrl ) {
  base.debugNow( 'Saving snapshot as image to server' )
  // send dataUrl to be written to server
  $.ajax( {
    type: "POST",
    url: "php/save_img.php",
    data: {
      imgBase64: dataUrl
    }
  } ).done( function( result ) {
    // php will either return false or the file location, handle accordingly
    if ( result ) {
      base.debugNow( 'Saved.' )
    } else {
      base.debugNow( 'Unable to save image to server' )
    }
  } ) 
}

function open( dataUrl ) {
  // open dataUrl in new window for viewing
  window.open( dataUrl )
}

function display() {
  var imgBuffer = exports.snapchatMinusTheChat( exports.displayCanvas, exports.displayCtx )
  if ( imgBuffer ) {
    base.debugNow(2)
    // re-apply normal div functionality/visibility
    exports.displayCanvas.style.opacity = baseCanvasOpacity
    exports.displayCanvas.style.pointerEvents = 'auto'
    
    exports.displayCanvas.sonclick = function(){
      saveSnapshotToServer( imgBuffer )
      //open( dataUrl )
    }
    
    // fade snapshot after so many seconds
    setTimeout( function () {
      exports.displayCanvas.style.opacity = 0
      exports.displayCanvas.style.pointerEvents = 'none'
      base.debugNow(4)
    }, fadeCanvasIn*1000 )
    return imgBuffer
  } else {
    base.debugNow( 'No stream to load.')
    return null
  }
}
function createSnapshotEle( parentEle ) {
  
  // create canvas to spread use as a mediator to tranfer single images from 
  // video element to canvas which can then be exported to who knows what
  exports.snapshotCanvas = document.createElement( 'canvas' )
  exports.snapshotCanvas.setAttribute( 'id', 'snapshotCanvas' )
  exports.snapshotCanvas.classList.add( 'shotCanvas' )
  
  // store context of canvas for use later
  exports.snapshotCtx = exports.snapshotCanvas.getContext( '2d' )
  
  // add to DOM
  parentEle.appendChild( exports.snapshotCanvas )
  
}

function createDisplayEle( parentEle ) {
  
  // create canvas to spread use a method to display images and such for 
  // whatever we want
  exports.displayCanvas = document.createElement( 'canvas' )
  exports.displayCanvas.setAttribute( 'id', 'displayCanvas' )
  exports.displayCanvas.classList.add( 'shotCanvas' )
  
  // store context of canvas for use later
  exports.displayCtx = exports.displayCanvas.getContext( '2d' )
  
  // add to DOM
  parentEle.appendChild( exports.displayCanvas )
  
}

},{"./base.js":1,"./log.js":5,"./video.js":9}],9:[function(require,module,exports){
// video.js
exports = module.exports


var base = require( './base.js' )
var log = require( './log.js' )
var controls = require( './controls.js' )
exports.overlay = require( './videoOverlay.js' )


// initialize live video feed related components
exports.mainVideo = null
var cycleStreamControl = null
exports.videoAspectRatio = null
var videoStreams = []
exports.curStream = null


exports.init = function () {
  
  exports.overlay.init()
  
  createVideoEle( base.content )
  
  exports.loadStreams()
  
  log.debug( 'video.js initialized.' )
  
}

exports.loadStreams = function() {
  
  // cross browser up
  navigator.getUserMedia = (
    navigator.getUserMedia || 
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
    )
  
  // define peer connection
  var peerConnection = ( 
    window.RTCPeerConnection || 
    window.mozRTCPeerConnection || 
    window.webkitRTCPeerConnection || 
    window.msRTCPeerConnection
    )
    
  var pc = new peerConnection( { iceServers: [] } )

  // find out what sources we have available and start stream with default
  MediaStreamTrack.getSources( function( srcs ) { /*global MediaStreamTrack*/
    for ( var idx = 0; idx < srcs.length; ++idx ) {
      var src = srcs[idx]
      if ( src.kind === 'video' ) videoStreams.push( src )
    }
    if ( videoStreams.length ) {
      if ( videoStreams.length > 1 ) {
        // special case if we found more than one usable stream
        createCycleStreamControl()
      } else if ( cycleStreamControl !== null ) {
        // otherwise try to remove control if it exists
        controls.remove( cycleStreamControl )
        cycleStreamControl = null
      }
      setStream( videoStreams[0] )
    } else {
      exports.curStream = null
      log.debug( 'no video streams found.' )
    }
  } )
}

function setStream( src ) {
  if ( exports.mainVideo === null ) {
    log.debug( 'video element nonexistent: cannot set stream' )
    return
  }
  
  if ( exports.curStream ) exports.curStream.stream.stop()
  
  // update aspect ratio value
  exports.mainVideo.onloadedmetadata = function() { 
    exports.videoAspectRatio = exports.mainVideo.videoWidth / exports.mainVideo.videoHeight
    exports.overlay.resizeOverlayCanvas()
    //exports.overlay.test()
    base.hideCurtain()
  }
  
  // save source as current source
  exports.curStream = src
  
  // run process to reset video stream
  navigator.getUserMedia( {
    video: { 
      optional: [ { sourceId: src.id } ]
    } }, function( stream ) {
    exports.mainVideo.src = window.URL.createObjectURL( stream )
    src.stream = stream
    exports.mainVideo.play()
    log.debug( 'stream ' + src.id + ' is up.' )
  }, function ( err ) { log.debug( err ) } )
}

function cycleStream() {
  if ( videoStreams.length ) {
    var curVideoInd = videoStreams.indexOf( exports.curStream )
    if ( videoStreams.length === 1 ) {
      return
    } else if ( curVideoInd === ( videoStreams.length - 1 )  ) {
      setStream( videoStreams[0] )
    } else {
      setStream( videoStreams[curVideoInd+1] )
    }
  } else {
    log.debug( 'no stream: cannot cycle stream' )
  }
}


function createVideoEle( parentEle ) {
  
  // create html5 video element...
  // this is preferrable for many reasons: it is fast, supports remote 
  // streams and local files, has cool filtering ability, and is more future-
  // proof than other choices
  exports.mainVideo = document.createElement( 'video' )
  exports.mainVideo.setAttribute( 'id', 'mainVideoOne' )
  exports.mainVideo.classList.add( 'mainVideo' )
  exports.mainVideo.autoplay = true
  
  // add to DOM
  parentEle.appendChild( exports.mainVideo )
  
}

function createCycleStreamControl() {
  // need a control to cycle through video streams if we end up having multiple
  // streams
  cycleStreamControl = controls.add( 'push', cycleStream, 'cycleVideoStreamControlOne', '&#10170;' )
}

},{"./base.js":1,"./controls.js":3,"./log.js":5,"./videoOverlay.js":10}],10:[function(require,module,exports){
// videoOverlay.js
exports = module.exports = {}


var base = require( './base.js' )
var log = require( './log.js' )
var video = require( './video.js' )


// initialize overlay canvas stuff for drawing and other effects
var overlayCanvas = null
var overlayCtx = null
var overlayConvBase = null
var overlayConvSize = null
var overlayConvPix = null


exports.init = function () {
  
  createOverlayEle( base.content )
  
  window.addEventListener( 'resize', exports.resizeOverlayCanvas, false )
  
  log.debug( 'videoOverlay.js initialized.' )
  
}

exports.clear = function() {
  overlayCtx.clearRect( overlayConvBase[0], overlayConvBase[1], overlayConvSize[0], overlayConvSize[1] )
}

exports.drawRect = function( x, y, w, h , scale ) {
  if ( !scale ) scale = 1
  
  overlayCtx.beginPath()
  overlayCtx.lineWidth = '4'
  overlayCtx.strokeStyle = 'white'
  var rect = overlayCtx.rect( overlayConvBase[0]+x*overlayConvPix[0]/scale,
                              overlayConvBase[1]+y*overlayConvPix[1]/scale, 
                              w*overlayConvPix[0]/scale,
                              h*overlayConvPix[1]/scale )
  overlayCtx.stroke()
  return rect
}

exports.test = function() {
  exports.drawRect( 0, 0, video.mainVideo.videoWidth-1, video.mainVideo.videoHeight-1 )
  log.debug( 'ran video overlay canvas test.' )
}

exports.resizeOverlayCanvas = function() {
  // restore whatever was on the canvas after resize
  /*
  var oldCanvasData = overlayCanvas.toDataURL()
  var pastWidth = overlayCanvas.width
  var pastHeight = overlayCanvas.width
  */
  overlayCanvas.width = window.innerWidth
  overlayCanvas.height = window.innerHeight
  /*
  var img=new Image();
  img.onload = function() {
    overlayCtx.drawImage( img, 0, 0, img.width, img.height,
                          0, 0, overlayCanvas.width, overlayCanvas.height )
  }
  img.src=oldCanvasData;
  */
  
  // update overlay canvas conversion offset and sizes
  var overlayCanvasAspectRatio = overlayCanvas.width / overlayCanvas.height
  if ( overlayCanvasAspectRatio < video.videoAspectRatio ) {
    overlayConvBase = [ 0, Math.round( overlayCanvas.height/2 - overlayCanvas.width / 2 / video.videoAspectRatio ) ]
    overlayConvSize = [ overlayCanvas.width, Math.round( overlayCanvas.width / video.videoAspectRatio ) ]
  } else {
    overlayConvBase = [ Math.round( overlayCanvas.width/2 - overlayCanvas.height / 2 * video.videoAspectRatio ), 0 ]
    overlayConvSize = [ Math.round( overlayCanvas.height * video.videoAspectRatio ), overlayCanvas.height ]
  }
  overlayConvPix = [ overlayConvSize[0] / video.mainVideo.videoWidth, overlayConvSize[1] / video.mainVideo.videoHeight ]
  
}

function createOverlayEle( parentEle ) {
  
  // create canvas to spread over full window...
  // this is nice as it allows us to accurately and quickly draw or add overlay
  // to any piece of the application (also included in this module is specs as 
  // to easy get coordinates of video frame w/ respect to this overlay canvas)
  overlayCanvas = document.createElement( 'canvas' )
  overlayCanvas.setAttribute( 'id', 'overlayCanvas' )
  overlayCanvas.classList.add( 'overlayCanvas' )
  
  // store context of canvas for use later
  overlayCtx = overlayCanvas.getContext( '2d' )
  
  // add to DOM
  parentEle.appendChild( overlayCanvas )
  
}

//
},{"./base.js":1,"./log.js":5,"./video.js":9}]},{},[6]);
