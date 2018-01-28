
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

var Vec3 = function(){
	return {x:0, y:0, z:0}	
}


/*function update(){
	for (var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('serverInfo', PLAYER_LIST);
	}
}
*/

var socketList = {};
var playerList = {}; //player list of Player-type variables

io.sockets.on('connection', function(socket){
	
	socket.id = makeId();
	
	socketList[socket.id] = socket; 
	var player
	
	socket.on('createRoom', function(data) {
		var room = Room.make();
		player = Player.make();
		room.addPlayer(player);
		socket.emit('createRoomSuccess', 
		{	player : player.getInfo(), 
			room : room.getInfo()
		});
											
		roomList.addRoom(room);
	});
	
	playerList[socket.id] = player;
	
	
	socket.on('buttonPress', function(msg){
		console.log(msg.data);
		console.log("Message received from Client");
	});
	
	
	function makeId()
	{
		var id = Math.random().toString().slice(-7,-1);
		while (socketList[id]) id = Math.random().toString().slice(-7,-1);
		return id;
	}
	
	socket.emit('serverMsg', {number:5});
	
		
	});
	
	/////////////////////////////////////////////////////////////////////////////
	

	var Player = {
		
		
		make : function()
		{ 
			var self = {
				direction : Vec3(),
				id: ID.playerID.get(),
				getInfo : Player.getInfo
			}
			return self;
		},
	
		getInfo: function()
		{
			return {
				id: this.id,
				direction: this.direction
			}
		
		},
	
		setInfo: function(data)
		{
			this.direction = data.direction 
			//right now, all we need is the direction from the data being received from the clients
		}
	
	}


	
	
	