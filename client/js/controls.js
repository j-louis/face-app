// controls.js
exports = module.exports = {}
exports.version = '1.0'


var base = require( './base.js' )
var log = require( './log.js' )


// initialize controls overlay related components
exports.controlsStack = []
var baseOpacity = 0.65
var containerDiv = null


exports.init = function() {

  createControlsEle( base.content )
  
  exports.fadeIn()
  
  log.debug( 'controls.js initialized.' )
  
}

exports.add = function( type, action, id, icon ) {
  
  if ( containerDiv === null ) {
    log.debug( 'cannot add control: controlsContainer not yet intialized ')
    return
  }
  
  // create container element for container
  var controlDiv = document.createElement( 'nav' )
  controlDiv.setAttribute( 'id', id )
  controlDiv.classList.add( 'baseButton' )
  
  // add anything to the inside of the control container
  if ( typeof icon === 'string' || icon instanceof String ) {
    controlDiv.classList.add( 'asciiButton' )
    controlDiv.innerHTML = icon
  }
  
  // attach action to control
  if ( type == 'push' ) {
    controlDiv.addEventListener( 'click', action, false )
  } else if ( type == 'toggle' ) {
    controlDiv.state = false
    controlDiv.addEventListener( 'click', function() {
      if ( controlDiv.state ) {
        action[1]()
        controlDiv.classList.remove( 'toggle' )
        controlDiv.state = false
      } else {
        action[0]()
        controlDiv.classList.add( 'toggle' )
        controlDiv.state = true
      }
    }, false )
  } else {
    log.debug( 'unknow control type: cannot add control' )
  }
  
  // keep track of controls
  exports.controlsStack.push( controlDiv )
  
  // add control to DOM
  containerDiv.appendChild( controlDiv )
  
  return controlDiv
}

exports.remove = function( id ) {
  
  // remove from our stack
  exports.controlsStack.splice( exports.controlsStack.indexOf( id ), 1 )
 
  // remove from DOM
  containerDiv.removeChild( id )
  
}

function createControlsEle( parentEle ) {
  // creating the DOM elements dynamically allows us to use node modules 
  // modularly in a way that allows specific features to be used or not used 
  // nicely
  
  // create container element for controls overlay
  containerDiv = document.createElement( 'div' )
  containerDiv.setAttribute( 'id', 'controlsContainer' )
  containerDiv.classList.add( 'controlsContainer' )
  containerDiv.classList.add( 'noSelect' )
  
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

exports.fadeInControl = function( controlDiv ) {
  controlDiv.style.display = 'inherit'
  controlDiv.style.visibility = 'visible'
  controlDiv.style.opacity = baseOpacity
}

exports.fadeOutControl = function( controlDiv ) {
  controlDiv.style.display = 'none'
  controlDiv.style.visibility = 'hidden'
  controlDiv.style.opacity = 0
}
