// fps.js
exports = module.exports = {}


var controls = require( './controls.js' )


var lis = null
var ticks = 0
var tic = null
exports.fpss = null
var updateEvery = 1 * 1000 // update fps counter every ***ms
var fpsDisplayDiv = null


exports.init = function() {
  
  // reset variables
  lis = null
  ticks = 0
  tic = null
  exports.fpss = null
  
  // create fps counter display
  fpsDisplayDiv = createFpsDisplay()
  
}

exports.initReverse = function() {
  controls.remove( fpsDisplayDiv )
}

exports.start = function() {
  lis = setInterval( exports.update, updateEvery )
}

exports.stop = function() {
  clearInterval = null
}

exports.tick = function() {
  ticks++
}

exports.update = function() {
  
  var toc = performance.now()
  exports.fpss = ticks / ( toc - tic ) * 1000
  fpsDisplayDiv.innerHTML = exports.fpss.toFixed( 0 ).toString()
  
  // reset fps variables
  ticks = 0
  tic = performance.now()
  
}

function createFpsDisplay() {
  return controls.add( 'push', exports.update, 'fpsControlDisplay', '0' )
}