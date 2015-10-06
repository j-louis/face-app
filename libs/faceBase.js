// faceBase.js
exports = module.exports = {}
exports.version = '1.0'

var cv = require( 'opencv' )
var fs = require( 'fs' )

var snapshot = require( './snapshot.js' )

exports.init = function() {
  
}

exports.newCon = function( nsp, socket ) {
  
  socket.on( 'getFace', function( imgData ) {
    
    var imgBuf = snapshot.getImgBuf( imgData )
    
    cv.readImage( imgBuf, function( err, img ) {
      
      if ( err ) throw err
      if ( img.width() < 1 || img.height() < 1 ) throw new Error( 'Image has no size' )
      
      img.detectObject( cv.EYE_CASCADE, {}, function( err, eyes ) {
        if ( err ) throw err
        img.detectObject( cv.FACE_CASCADE, {}, function( err, faces ) {
          if ( err ) throw err
          socket.emit( 'getFaceRes', { matches: faces.concat( eyes ) } )
        } )
      } )
      
    } )
    //socket.emit( 'getFaceRes', { matches: [{x: 132, y: 106, width: 113, height: 113}] } )
  } )
  
}
