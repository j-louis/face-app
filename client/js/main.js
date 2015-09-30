// main.js

var base = require( './base.js' )
var log = require( './log.js' )
var controls = require( './controls.js' )
var chatRoulette = require( './chatRoulette.js' )
var punkCounter = require( './punkCounter.js' )
var video = require( './video.js' )
var snapshot = require( './snapshot.js' )
var faceBase = require( './faceBase.js' )


function init() {
  
  log.debug( 'Initializing . . .' )
  
  // back to basic b*@%&#s
  base.init()
  //base.hideCurtain()
  // initialize debug container so we can have nice debugging in our face 
  // (removing this for production will still allow all debug messages to be sent
  // to the console) (good to do this early so we get nice debugging to the 
  // screen)
  log.init()
  
  // initialize control container for a responsive controls template which can 
  // be utilized by other modules to add/remove controls and such (good to do
  // this early so that any following modules can instantiate controls they need
  // immediately)
  controls.init()
  
  // it would be nice to be notified of additonal user of the app and be able to
  // store relevant information about those who are connected and if they 
  // disconnect
  punkCounter.init()
  
  chatRoulette.init()
  
  video.init()
  
  snapshot.init()
  
  faceBase.init()
  
}

// go!
init()