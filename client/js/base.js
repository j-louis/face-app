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
