
var serverFPS = 40;
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	// req = request, res = result
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client/'));

serv.listen(process.env.PORT || 2000);
console.log('server started');

var io = require('socket.io')(serv, {});
var ID = {
	get: function(){
		this.id += 1; 
		return this.id;
	},
	
}
ID.roomID = {
		id: 0, 
		get:ID.get
	}
	
ID.playerID = {
		id:0,
		get:ID.get
		
	}
	
	



var Room = {
	make : function(){
		return {
			id: ID.roomID.get(),
			player: {},
			update: function() {
				for (var i in this.players) {
					players[i].update();
				}
			}
			
		}
	}
}

var Vec3 = {
	make : function(x,y,z){
		return {
			x : x,
			y : y,
			z : z
		}
	}
}

var Player = {
	make : function(){ 
		var self = {
			position : Vec3(0,0,0), 
			id: ID.playerID.get()
		}
		return self;
	}
}

/*function update(){
	for (var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('serverInfo', PLAYER_LIST);
	}
}
*/

io.sockets.on('connection', function(socket){

	socket.on('createRoom', function(data) {
		var room = Room.make();
		var player = Player.make();
		room.addPlayer(player);
		socket.emit('createRoomSuccess', {player : player.getInfo(), 
											room : room.getInfo()
											});
											
		roomList.addRoom(room);
	});
	
	socket.on('buttonPress', function(msg){
		console.log(msg.data);
		console.log("Message received from Client");
	});
	
	socket.emit('serverMsg', {number:5});
	
	//var player = Player(socket.id);
	//socket.id = makeID();
	//socket.on('clientInfo', function(client){
		// player position 
	});
	
	
