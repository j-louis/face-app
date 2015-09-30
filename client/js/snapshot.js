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
exports.snapshotScaleFactor = 0.01
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
/*
self.canvas.toBuffer(function(err, buf){
  if (err) throw err;
  io.emit('frame', buf);
});
*/
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
