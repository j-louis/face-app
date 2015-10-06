// SudokuSolver.js
var version = '1.0'

var fs = require( 'fs' )


function SudokuSolver() {
  // constructor
  this.version = version
  
  this.commonBrdSizes = [ 
    [9,9],
    ]
  
  // for now, hardcode allowable range of values for puzzle
  this.allowedValRng = [1,9]
  
  // initialize any important variables (but leave as method so this can be 
  // re-done at runtime if need be)
  this.reset()
  
}

SudokuSolver.prototype.reset = function() {
  
  // two element array describing board size
  this.brdSize = null
  
  // array for holding puzzle data
  this.brdData = null
  
  // for now, hardcode the board clusters for normal 3x3 grids on 9x9 boards
  this.brdClusters = null
  
  // mask array to logically show what data points were present at board initialization
  this.maskDataInit = null
  
  // process.hrtime() results for timing of solve
  this.tic = null
  this.toc = null

}

SudokuSolver.prototype.initBrd = function( rawBrdData, size ) {
  
  // reset to intial state
  this.reset()
  
  // assume data is ordered in rows
  this.brdData = rawBrdData
  
  // hold brd size data for use later
  if ( size == undefined ) {
    var brdSize = this.guessBrdSize()
    if ( brdSize == null ) {
      this.reset()
      return null
    } else {
      this.brdSize = brdSize
    }
  } else {
    this.brdSize = size
  }
  
  // check if inital board layout is possible
  if ( !this.isBrdDataValid() ) {
    console.log( 'Solver Runtime Error: Intial Board layout not possible, resetting.' )
    
    // reset to intial state
    this.reset()
    return null
  }
  
  // update mask arrays to logically show what starting data points are cemented
  // and what data points we should try to solve for
  this.maskDataInit = this.brdData.map( function(x) { return x>0 } )
  this.maskDataUnk = this.brdData.map( function(x) { return x==0 } )
  
  // update coordinates for of logically true elements in mask arrays, this is 
  // done for quick iterations
  this.maskDataInitLoc = []
  this.maskDataUnkLoc = []
  for ( var idx=0; idx<this.brdData.length; idx++ ) {
    if ( this.brdData[idx] == 0 ) {
      this.maskDataUnkLoc.push( idx )
    } else {
      this.maskDataInitLoc.push( idx )
    }
  }
  
  // define clusters for each unknown element
  this.defineClusters()
  
}

SudokuSolver.prototype.readBrdData = function( filename ) {
  
  var data = fs.readFileSync( filename, 'utf8', function( err ) {
    if ( err ) throw err
  } )
  
  var strArr = data.toString().split( ' ' )
  var intArr = strArr.map( function(x) { return parseInt(x) } )
  
  return intArr
}

SudokuSolver.prototype.guessBrdSize = function() {
  
  var commonEleCnt = this.commonBrdSizes.map( 
    function(x) { return x.reduce( function(prev,curr,idx,arr) { return prev*curr } ) } )
  
  var potIdx = []
  for ( var idx=0; idx<commonEleCnt.length; idx++ )
    if ( commonEleCnt[idx] == this.brdData.length ) potIdx.push( idx )
  
  if ( potIdx.length == 1 ) {
    return this.commonBrdSizes[ potIdx[0] ]
  } else if ( potIdx.length > 1 ) {
    console.log( 'Solver Implementation Error: Found ' + potIdx.length + ' potential board sizes.' )
    return null
  } else {
    console.log( 'Solver Runtime Error: Unable to guess board size.' )
    return null
  }
  
}

SudokuSolver.prototype.defineClusters = function() {
  
  var clusterDef = [
    1,1,1,2,2,2,3,3,3,
    1,1,1,2,2,2,3,3,3,
    1,1,1,2,2,2,3,3,3,
    4,4,4,5,5,5,6,6,6,
    4,4,4,5,5,5,6,6,6,
    4,4,4,5,5,5,6,6,6,
    7,7,7,8,8,8,9,9,9,
    7,7,7,8,8,8,9,9,9,
    7,7,7,8,8,8,9,9,9,
    ]
  
  this.brdClusters = new Array()
  for ( var idx=0; idx<clusterDef.length; idx++ ) {
    this.brdClusters.push( new Array() )
    var clusterIdx = -1
    do {
      clusterIdx = clusterDef.indexOf( clusterDef[idx], clusterIdx+1 )
      if ( (clusterIdx!=idx) && clusterIdx!=-1 ) this.brdClusters[idx].push( clusterIdx )
    } while ( clusterIdx!=-1 );
  }
  
}

SudokuSolver.prototype.solve = function*() {
  
  // let's time ourselves!
  this.tic = process.hrtime()
  
  var curIdx = 0
  while ( this.brdData.some( function(x) { return x == 0 } ) ) {
    while ( ( this.brdData[this.maskDataUnkLoc[curIdx]]==0 ||
              !this.check(this.maskDataUnkLoc[curIdx]) ) &&
              curIdx !=-1 ) {
      while ( this.brdData[this.maskDataUnkLoc[curIdx]] == this.allowedValRng[1] ) {
        this.brdData[this.maskDataUnkLoc[curIdx]] = 0
        curIdx--
        if ( curIdx==-1 ) {
          console.log( 'Solver Runtime Error: Unable to solve board.' )
          this.toc = process.hrtime( this.tic )
          return null
        }
      }
      this.brdData[this.maskDataUnkLoc[curIdx]]++
    }
    yield this.brdData[this.maskDataUnkLoc[curIdx]]
    curIdx++
  }
  this.toc = process.hrtime( this.tic )
  
}

SudokuSolver.prototype.check = function( idx ) {
  return this.checkCardinals( idx ) && this.checkCluster( idx )
}

SudokuSolver.prototype.checkCardinals = function( idx ) {
  
  // check below element
  var botIdx = idx - this.brdSize[1]
  if ( botIdx >= 0 )
    for ( ; botIdx>=0; botIdx-=this.brdSize[1] )
      if ( this.brdData[idx] == this.brdData[botIdx] ) return false
  
  // check to the right of element
  var rightIdx = idx + 1
  if ( (idx+1) < this.brdData.length )
    for ( ; (rightIdx) % this.brdSize[1]; rightIdx++ )
      if ( this.brdData[idx] == this.brdData[rightIdx] ) return false
  
  // check above element
  var topIdx = idx + this.brdSize[1]
  if ( topIdx < this.brdSize.length )
    for ( ; topIdx<this.brdData.length; topIdx-=this.brdSize[1] )
      if ( this.brdData[idx] == this.brdData[topIdx] ) return false
  
  // check to the left of element
  var leftIdx = idx - 1
  if ( leftIdx >= 0 )
    for ( ; (leftIdx+1) % this.brdSize[1] || leftIdx==0; leftIdx-- )
      if ( this.brdData[idx] == this.brdData[leftIdx] ) return false
  
  return true
}

SudokuSolver.prototype.checkCluster = function( idx ) {
  var val = this.brdData[idx]
  return this.brdClusters[idx].every( x => x!=val )
}

SudokuSolver.prototype.disp = function() {
  
  var cols = this.brdSize[1]
  function dispIter( prev, curr, idx, arr ) {
    if ( (idx) % cols == 0 ) {
      return prev + '|\n|' + curr
    } else {
      return prev + ' ' + curr
    }
  }
  console.log( 
    Array( this.brdSize[1] + 1 ).join( ' _' ) + '\n|' +
    this.brdData.reduce( dispIter ) +
    '|\n'
    )
  
}

SudokuSolver.prototype.isBrdDataValid = function() {
  
  return true
}


// export the class
module.exports = SudokuSolver