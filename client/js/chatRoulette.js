// chatRoulette.js
exports = module.exports = {}
exports.version = '1.0'


var log = require( './log.js' )
var controls = require( './controls.js' )


// define any random-stranger-video-chat-related stuff here
var chatRouletteControl = null

exports.init = function() {

  createChatRouletteControl()
  
  log.debug( 'chatRoulette.js initialized.' )
  
}

function createChatRouletteControl() {
  chatRouletteControl = controls.add( 'push', chatRoulette, 'chatRouletteControl', '&phone;' )
}

function chatRoulette() {
  log.debug( 'chatRoulette has not yet been implemented' )
}

