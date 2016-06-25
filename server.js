var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
//socket.emit will send to ONLY the connected client that signalled the server
//io.emit will send to ALL connected clients
//socket.broadcast.emit will send to ALL connected clients EXCEPT for the client that signaled the server


var server = app.listen(app.get('port'), function(){
	console.log("Express started on 54.201.94.228:" + app.get('port') + ", press Ctrl-C to terminate");
});

var io = require('socket.io').listen(server);

app.get('/', function(req, res){
	var context = {};
	context = 'WebRTC Project Homepage';
	res.render('samplePeerConn', {title: context});
});

app.get('/channels', function(req, res){
	var context = {};
	context = 'WebRTC Project Data Channels';
	res.render('dataChannels', {title: context});
});


io.on('connection', function(socket){
	socket.on('ready', function(req){
		console.log(req);
		socket.join(req.chat_room);
		socket.join(req.signal_room);
		socket.join(req.files_room);
		socket.broadcast.emit('announce', {
			message: 'new client in the ' + req + ' room.'
		})
	});
	socket.on('send', function(req) {
	    socket.broadcast.emit('message', {
	        message: req.message,
			author: req.author
	    });
	})
	//WebRTC signalling
	//user1 joins signaling server
	//user1 sends offer
	//user2 joins signaling server
	//user2 sends offer
	//user1 accepts user2 offer, user1 sends ICE
	//user2 sends ICE 
	//RTCPeerConnection
	socket.on('signal', function(req){
		//the use of broadcast.emit so only the sender does NOT receive their own messages
		console.log('req.type: ' + req.type);
		console.log('req.message: ' + req.message);
		socket.broadcast.emit('signaling_message', {
			type: req.type,
			message: req.message
		});
	});
		
	socket.on('files', function(req){
		socket.broadcast.emit('files', {
			filename: req.filename,
			filesize: req.filesize
		});
	});
});
