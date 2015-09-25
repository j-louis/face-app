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


