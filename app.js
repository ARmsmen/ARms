
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

ID.socketID = {
		id:0,
		get:ID.get
		
}



var Room = {
  make : function(){
		return {
			id: ID.roomID.get(),
			playerList: {},
			update: Room.update,
			addPlayer:Room.addPlayer,
      removePlayer:Room.removePlayer,

      getId: function(){
        return {id: this.id};
      },

      getInfo: function(){
        return {
          id: this.id,
          playerList: playerList
        }
      },

      getPlayer: function(playerID){
        return this.playerList[playerID];
      }
		}
	},

  update: function() {
    for (var player_i in this.playerList) {
      player_i.update();  //pass roomId?
    }
  },

  addPlayer : function(player){
    var id = player.getId();
    this.playerList[id] = player;
  },

  removePlayer : function(player){
    var playerId = player.id;
    delete this.playerList[playerId];
  }
}

var roomList = {
  roomList:{},

  addRoom:function(room){
    this.roomList[room.getId()] = room;
  },

  getRoom:function(roomId){
    return this.roomList[roomId];
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
	
	socket.id = ID.socketID.get();
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
	
	
	socket.on('disconnect', function(data){ disconnect(socket, data);});
	
	function sendToAll(infoType, data){
	for (var i in SOCKET_LIST){
		SOCKET_LIST[i].emit(infoType , data);
	}
	}
	
	function disconnect(socket, data){
		// pass room id in data 
		var id = socket.id;
		var data = data || {};
		var type = data.type || 'has disconnected';
		var name = PLAYER_LIST[socket.id].name;
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
		
		sendToAll('deleteinfo', {id : id});
	}
	
	
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


	
	
	
