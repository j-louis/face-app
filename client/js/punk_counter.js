
// initialize any controls
var chatRouletteButton = document.getElementById( 'chatRouletteButton' )
chatRouletteButton.addEventListener( 'click', chatRoulette )
chatRouletteButton.style.display = 'inherit'

// initialize any socket events...

socket.on( 'punkCountChangeEvt', function ( data ) {
  // let user know he is not alone
  debugNow( 'Punk Count is now at ' + data.val )
  chatRouletteButton.innerHTML = data.val
} )

socket.on( 'connect', function () {
  // do all things we do when we connect...

} )

socket.on( 'disconnect', function () {
  // do all things we do when we disconnect...
  
} )

function chatRoulette() {
  debugNow( 'chatRoulette has yet to be defined' )
}

