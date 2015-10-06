// snapshot.js
exports = module.exports = {}
exports.version = '1.0'

var fs = require( 'fs' )
var path = require( 'path' )

exports.init = function() {
  
  exports.snapshotImgPath = path.resolve( path.join( 'img_snapshots' ) )
  if ( ! fs.existsSync( exports.snapshotImgPath ) ) fs.mkdirSync( exports.snapshotImgPath )
  
}

exports.newCon = function( nsp, socket ) {
  
  socket.on( 'saveSnapshot', function( imgData ) {
    var imgBuf = exports.getImgBuf( imgData )
    var imgFileType = exports.getImgFileType( imgData )
    if ( imgBuf && imgFileType ) {
      exports.writeImgBuf( imgBuf, imgFileType, function( imgFilePath ) {
        console.log( imgFilePath + ' file written.' )
      } )
    } else {
      console.log( 'cannot save snapshot: image buffer empty.' )
    }
  } )
  
}

exports.writeImgBuf = function( imgBuf, fileType, funcH ) {
  
  var filename = new Date().getTime().toString() + '.' + fileType
  var fullPath = path.join( exports.snapshotImgPath, filename )
  fs.writeFile( fullPath, imgBuf, function ( err ) {
    if ( err ) throw err
    if ( funcH != undefined ) funcH( fullPath )
  } )
  return fullPath
}

exports.getImgFileType = function ( imgData ) {
  
  if ( imgData && imgData != 'data:,' ) {
    var fileInfo = imgData.match( /^data:image\/(png|jpeg|bmp|webp);base64,/ )
    return fileInfo[1]
  } else {
    return null;
  }
  
}

exports.getImgBuf = function( imgData ) {
  
  // helper function to extract buffer from image data (assuing data is sent 
  // using canvas's .toDataUrl)
  if ( imgData && imgData != 'data:,' ) {
    return new Buffer( imgData.replace( /^data:image\/(png|jpeg|bmp|webp);base64,/, '' ), 'base64' )
  } else {
    return null;
  }
  
}