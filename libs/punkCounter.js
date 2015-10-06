// punkCounter.js
exports = module.exports = {}
exports.version = '1.0'


exports.init = function() {
  
  // keep track of the total number of users we have accessing our app
  exports.count = 0
  
}

exports.newCon = function( nsp, socket ) {
  
  socket.broadcast.emit( 'punkCounterPlusEvt', {
    // keep track when we gain a user (and let everyone know)
    'count': ++exports.count,
    'user': socket.id
  } )
  
  
  socket.on( 'disconnect', function() {
    // keep track when we lose a user (and let everyone know)
    socket.broadcast.emit( 'punkCounterMinusEvt', {
      'count': --exports.count,
      'user': socket.id
    } )
  } )
  
}
