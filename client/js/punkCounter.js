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
