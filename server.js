// server.js

var http = require( 'http' )
var cv = require( 'opencv' )
var io = require( 'socket.io' )
var express = require( 'express' )

var punkCounter = require( './libs/punkCounter.js' )
var snapshot = require( './libs/snapshot.js' )
var faceBase = require( './libs/faceBase.js' )

// define address and port
var ip = process.env.IP
var port = process.env.PORT || 5000

// scrape together basic webapp framework and define client file location
var app = express();
app.use( '/', express.static( __dirname + '/client') )

// make sure we give client webapp view if they come to our address
app.get('/', function(req, res){
  res.sendfile('client/index.html');
});

// create a simple http server
var server = http.createServer( app )
var io = io.listen( server )

// keep track of when we gain or lose a user (and let everyone know)
punkCounter.init()
// gives us nice canvas/video snapshot capabilities for applications
snapshot.init()
// who knows what this does yet
faceBase.init()
  
// define socket io connection events
var nsp = io.of( '/nsp' )


nsp.on( 'connection', function( socket ) {
  // do all things we do when we connect...
  
  // not currently necessary but placeholder for future
  if ( true ) {
    
    socket.join( 'basics' )
    //transports: ['websocket']console.log( io.nsps['/nsp'].adapter.rooms['basics'] )
    
    console.log( 'server has gained a connection.' )
    
    socket.on( 'disconnect', function() {
      // do all things we do when we disconnect...
      console.log( 'server has lost a connection.' )
    } )
    
    punkCounter.newCon( nsp, socket )
    snapshot.newCon( nsp, socket )
    faceBase.newCon( nsp, socket )
    
  }
  
} )

// and finially run our server at given address (and port)
server.listen( port, ip, function() {
  console.log( 'listening on port ' + port + ' at ' + ip )
} )

/*
var server = http.createServer()
var io = socketio.listen( server )
// index.js
io.on('connection', function(socket){
  socket.on('join', function(room){
    var clients = io.sockets.adapter.rooms[room];
    var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
    console.log( numClients )
    if(numClients == 0){
      socket.join(room);
    }else if(numClients == 1){
      socket.join(room);
      socket.emit('ready', room);
      socket.broadcast.emit('ready', room);
    }else{
      socket.emit('full', room);
    }
  });
});




server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
*/



