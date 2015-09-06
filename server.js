var http = require('http')
var cv = require( 'opencv' )
var io = require('socket.io')
var express = require('express')

// define address and port
//var ip = process.env.IP
//var port = process.env.PORT
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080

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

// keep track of the total number of users we have accessing our app
var punkCount = 0

// define socket io connection events
io.on( 'connection', function( socket ) {
  
  // keep track of when we gain a user (and let everyone know)
  io.sockets.emit( 'punkCountChangeEvt', { 'val': ++punkCount } )
  
  socket.on( 'disconnect', function() {
    
    // keep track when we lose a user (and let everyone know)
    io.sockets.emit( 'punkCountChangeEvt', { 'val': --punkCount } )
  } )
  
  socket.on( 'go', function( data ) {
    //var img = new cv.Matrix( data.height, data.width )
    //console.log( img )
    var imgBuf = new Buffer( data.buf.replace( /^data:image\/(png|jpg);base64,/, '' ), 'base64' )
    cv.readImage( imgBuf, function( err, img ) {
      if ( err ) throw err
      if ( img.width() < 1 || img.height() < 1 ) throw new Error( 'Image has no size' )
      img.detectObject( cv.FACE_CASCADE, {}, function( err, matches ) {
        if ( err ) throw err
        socket.emit( 'goRes', { matches: matches } )
        for ( var idx=0; idx<matches.length; ++idx ) {
          var match = matches[idx]
          var COLOR = [0, 255, 0]; // default red
          var thickness = 2; // default 1
          img.rectangle([match.x, match.y], [match.x + match.width, match.y + match.height], COLOR, 2);
        }
        img.save('face-detection-rectangle.png');
      } )
    } )
  } )
  
} )

// and finially run our server at given address (and port)
server.listen( port, ip, function() {
  console.log('listening on port ' + port + ' at ' + ip );
});

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
