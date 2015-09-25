// log.js
exports = module.exports = {}
exports.version = '1.0'


var base = require( './base.js' )


// initialize log overlay related components
exports.logStack = []
exports.debugStack = []
var fadeDur = 15  //seconds
var baseOpacity = 0.65
var containerDiv = null
var contentsDiv = null


exports.init = function() {

  createLogEle( base.content )
  
  exports.debug( 'log.js initialized.' )
  
}

exports.debug = function( string ) {
  // log the information prettily if the DOM already has the debug stuff
  // initialized
  
  if ( contentsDiv ) {
    
    // create debug text element
    var debugEle = document.createElement( 'div' )
    debugEle.classList.add( 'logOverlayElement' )
    debugEle.innerHTML = string
    
    // add debug element to log container contents
    exports.fadeIn()
    contentsDiv.insertBefore( debugEle, exports.logStack[0] )
  
    // keep track of debug elements and all logs
    exports.debugStack.unshift( debugEle )
    exports.logStack.unshift( debugEle )
    
    // set action to remove element from debug container
    setTimeout( function() {
      contentsDiv.removeChild( exports.logStack.pop() )
      if ( !exports.logStack.length ) exports.fadeOut()
    }, fadeDur*1000 )
    
  }
  
  // it would be unfair to leave the old console out
  console.log( string )
  
}

function createLogEle( parentEle ) {
  // creating the DOM elements dynamically allows us to use node modules 
  // modularly in a way that allows specific features to be used or not used 
  // nicely
  
  // create container element for log overlay
  containerDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'logContainerDiv' )
  containerDiv.classList.add( 'logOverlayContainer' )
  
  // we need another container to hold the actual log elements
  contentsDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'logContentsDiv' )
  contentsDiv.classList.add( 'logOverlayContents' )
  containerDiv.appendChild( contentsDiv )
  
  // add to DOM
  parentEle.appendChild( containerDiv )
  
}

exports.fadeIn = function() {
  containerDiv.style.visibility = 'visible'
  containerDiv.style.opacity = baseOpacity
}

exports.fadeOut = function() {
  containerDiv.style.visibility = 'hidden'
  containerDiv.style.opacity = 0
}

