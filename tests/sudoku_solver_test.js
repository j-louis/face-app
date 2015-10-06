var SudokuSolver = require( '../libs/SudokuSolver.js' )

var solver = new SudokuSolver()
console.log( 'initialized instance of SudokuSolver v' + solver.version )

var files = [
  './sudoku_9x9_easy.txt',
  './sudoku_9x9_medium.txt',
  './sudoku_9x9_medium.txt',
  ]
  
for ( var idx=0; idx<files.length; idx++ ) {

  console.log( '\n-----' )
  console.log( files[idx] )
  
  solver.initBrd( solver.readBrdData( files[idx] ) )
  
  var gen = solver.solve()
  var result = gen.next()
  
  while ( !result.done ) {
    result = gen.next()
  }
  
  solver.disp()
  
  console.log( 'Solved in ' + solver.toc[1]/1000000  + ' ms' )

}
