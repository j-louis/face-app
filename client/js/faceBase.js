// faceBase.js
exports = module.exports = {}


var base = require( './base.js' )
var log = require( './log.js' )
var controls = require( './controls.js' )
var video = require( './video.js' )
var snapshot = require( './snapshot.js' )
var fps = require( './fps.js' )


// define any face action stuff here ;)
var toggleFaceControl = null
exports.fpsRunning = false


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
    //log.debug( data.matches )
    if ( toggleFaceControl.state ) {
      setTimeout( exports.getFace, 5 )
      if ( exports.fpsRunning ) fps.tick()
    } else {
      setTimeout( video.overlay.clear, 500 )
    }
  } )

  log.debug( 'faceBase.js initialized.' )
  
}

exports.getFace = function() {
  
  // get image buffer
  //var imgBuffer = snapshot.snapchatMinusTheChat( 
  //  snapshot.snapshotCanvas, 
  //  snapshot.snapshotCtx 
  //  )
  var imgBuffer = []
  base.socket.emit( 'getFace', { 
    width: snapshot.snapshotCanvas.width, 
    height: snapshot.snapshotCanvas.height, 
    buf: imgBuffer } )
    
}

function toggleFaceOn() {
  
  // start fps tracking
  exports.fpsRunning = true
  fps.init()
  fps.start()
  
  // run procedure
  exports.getFace()
}

function toggleFaceOff() {
  
  // clear any drawings
  video.overlay.clear()
  
  // stop fps and reset button label
  exports.fpsRunning = false
  fps.stop()
  fps.initReverse()
  
}

function createToggleFaceControl( parentEle ) {
  toggleFaceControl = controls.add( 'toggle', [ toggleFaceOn, toggleFaceOff ], 'getFaceControl', '&female;' )
}
