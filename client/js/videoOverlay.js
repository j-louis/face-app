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