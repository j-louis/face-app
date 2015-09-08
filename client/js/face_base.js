// initialize live video feed related components
var video = document.getElementById( 'mainVideo' )
var videoAspectRatio = null
var videoStreams = []
var curVideoStream = null

// initialize snapshot/display canvas components
var snapshotCanvas = document.getElementById( 'snapshotCanvas' )
var snapShotCtx = snapshotCanvas.getContext( '2d' )
var displayCanvas = document.getElementById( 'displayCanvas' )
var displayCtx = displayCanvas.getContext( '2d' )
var snapshotScaleFactor = 0.5
var fadeCanvasIn = 3 // seconds
var baseCanvasOpacity = 0.85

// initialize overlay canvas used for drawing and other effects
var overlayCanvas = document.getElementById( 'overlayCanvas' )
var overlayCtx = overlayCanvas.getContext( '2d' )
var overlayConvBase = null
var overlayConvSize = null
var overlayConvPix = null

// initialize debug overlay related components
var debugContainer = document.getElementById( 'debugContainer' )
var debug = document.getElementById( 'debugContents' )
var debugStack = []
var fadeDebugIn = 15 //seconds
var baseDebugOpacity = 0.5

// initialize any controls
video.addEventListener( 'click', displayCanvasSnapshot(), false )
var cycleSourceButton = document.getElementById( 'cycleStreamSourceButton' )
cycleSourceButton.addEventListener( 'click', cycleStreamSource, false )

var goButton = document.getElementById( 'goButton' )
goButton.addEventListener( 'click', go, false )
goButton.style.display = 'inherit'

// intitialize sockets !CHANGE!-env dep
//var socket = io.connect( 'https://face-app-jlouis.c9.io' )
var socket = io.connect( 'face-app.herokuapp.com' )

// Go!
init()


function init() {
  window.addEventListener( 'resize', resizeOverlayCanvas, false )
  video.onloadeddata = resizeOverlayCanvas
  loadStreams()
  
  debugNow( 'Initializing . . .' )
}

function go() {
  var imgBuffer = snapchatMinusTheChat( snapshotCanvas, snapShotCtx )
  socket.emit( 'go', { width: snapshotCanvas.width, height: snapshotCanvas.height, buf: imgBuffer } )
}
var matchesH = []
socket.on( 'goRes', function( data ) {
  overlayCtx.clearRect( overlayConvBase[0], overlayConvBase[1], overlayConvSize[0], overlayConvSize[1] )
  matchesH.length = 0
  for ( var idx=0; idx<data.matches.length; ++idx ) {
    matchesH.push( drawRect( 
      data.matches[idx].x, data.matches[idx].y, 
      data.matches[idx].width, data.matches[idx].height ) )
    debugNow( data.matches[idx] )
  }
  go()
} )

function resizeOverlayCanvas() {
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
  debugNow(overlayCanvasAspectRatio)
  if ( overlayCanvasAspectRatio < videoAspectRatio ) {
    overlayConvBase = [ 0, Math.round( overlayCanvas.height/2 - overlayCanvas.width / 2 / videoAspectRatio ) ]
    overlayConvSize = [ overlayCanvas.width, Math.round( overlayCanvas.width / videoAspectRatio ) ]
  } else {
    overlayConvBase = [ Math.round( overlayCanvas.width/2 - overlayCanvas.height / 2 * videoAspectRatio ), 0 ]
    overlayConvSize = [ Math.round( overlayCanvas.height * videoAspectRatio ), overlayCanvas.height ]
  }
  overlayConvPix = [ overlayConvSize[0] / video.videoWidth, overlayConvSize[1] / video.videoHeight ]
}

function drawRect( x, y, w, h ) {
  overlayCtx.beginPath()
  overlayCtx.lineWidth = '2'
  overlayCtx.strokeStyle = 'red'
  var rect = overlayCtx.rect( overlayConvBase[0]+x*overlayConvPix[0]/snapshotScaleFactor,
                              overlayConvBase[1]+y*overlayConvPix[1]/snapshotScaleFactor, 
                              w*overlayConvPix[0]/snapshotScaleFactor,
                              h*overlayConvPix[1]/snapshotScaleFactor )
  overlayCtx.stroke()
  return rect
}
function loadStreams() {
  // cross browser up
  navigator.getUserMedia = ( navigator.getUserMedia ||
                 navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia ||
                 navigator.msGetUserMedia )
  
  // define peer connection
  var peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
             window.webkitRTCPeerConnection || window.msRTCPeerConnection;
  var pc = new peerConnection( { iceServers: [] } )

  // find out what sources we have available and start stream with default
  MediaStreamTrack.getSources( function( srcs ) {
    for ( var idx = 0; idx < srcs.length; ++idx ) {
      var src = srcs[idx]
      if ( src.kind === 'video' ) videoStreams.push( src )
    }
    if ( videoStreams.length ) {
      if ( videoStreams.length <= 1 ) {
        cycleSourceButton.style.display = 'none'
      } else {
        cycleSourceButton.style.display = 'inherit'
      }
      setStream( videoStreams[0] )
    } else {
      curVideoStream = null
      cycleSourceButton.style.display = 'none'
      debugNow( 'No video streams found.' )
    }
  } )
}

function setStream( src ) {
  if ( curVideoStream ) curVideoStream.stream.stop()
  
  // update aspect ratio value
  video.onloadedmetadata = function() { videoAspectRatio = video.videoWidth / video.videoHeight }
  
  // save source as current source
  curVideoStream = src
  debugNow( 'Loading ' + src.label + ' stream . . .')
  
  // run process to reset video stream
  navigator.getUserMedia( {
    video: { 
      optional: [ { sourceId: src.id } ]
    } }, function( stream ) {
    video.src = window.URL.createObjectURL( stream )
    src.stream = stream
    video.play()
    debugNow( 'Stream is up!' )
  }, function ( err ) { debugNow( err ) } )
}

function cycleStreamSource() {
  var curVideoInd = videoStreams.indexOf( curVideoStream )
  if ( videoStreams.length === 1 ) {
    return
  } else if ( curVideoInd === ( videoStreams.length - 1 )  ) {
    setStream( videoStreams[0] )
  } else {
    setStream( videoStreams[curVideoInd+1] )
  }
}

function resizeCanvas( canvas ) {
  canvas.width = video.videoWidth * snapshotScaleFactor
  canvas.height = video.videoHeight * snapshotScaleFactor
}
function snapchatMinusTheChat( canvas, ctx ) {
  if ( curVideoStream ) {
    resizeCanvas( canvas )
    ctx.drawImage( video, 0, 0, canvas.width, canvas.height )
    return canvas.toDataURL()
  } else {
    debugNow( 'No stream to load.')
    return null
  }
}

function displayCanvasSnapshot() {
  var imgBuffer = snapchatMinusTheChat( displayCanvas, displayCtx )
  if ( imgBuffer ) {
    debugNow(2)
    // re-apply normal div functionality/visibility
    displayCanvas.style.opacity = baseCanvasOpacity
    displayCanvas.style.pointerEvents = 'auto'
    
    displayCanvas.sonclick = function(){
      saveSnapshotToServer( imgBuffer )
      //openSnapshot( dataUrl )
    }
    
    // fade snapshot after so many seconds
    setTimeout( function () {
      displayCanvas.style.opacity = 0
      displayCanvas.style.pointerEvents = 'none'
      debugNow(4)
    }, fadeCanvasIn*1000 )
    return imgBuffer
  } else {
    debugNow( 'No stream to load.')
    return null
  }
}

function saveSnapshotToServer( dataUrl ) {
  debugNow( 'Saving snapshot as image to server' )
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
      debugNow( 'Saved.' )
    } else {
      debugNow( 'Unable to save image to server' )
    }
  } ) 
}

function openSnapshot( dataUrl ) {
  // open dataUrl in new window for viewing
  window.open( dataUrl )
}

function debugNow( string ) {
  // create debug text element
  var debugEle = document.createElement( 'div' )
  debugEle.className = 'debugOverlayElement'
  debugEle.innerHTML = string
  
  // add debug element to debug container
  debugContainer.style.opacity = baseDebugOpacity
  debug.insertBefore( debugEle, debugStack[0] )
  
  // it would be unfair to leave the old console out
  console.log( string )
  
  // keep track of debug elements
  debugStack.unshift( debugEle )
  
  // set action to remove element from debug container
  setTimeout( function() {
    debug.removeChild( debugStack.pop() )
    if ( !debugStack.length ) debugContainer.style.opacity = 0
  }, fadeDebugIn*1000 )
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


