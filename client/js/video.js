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
