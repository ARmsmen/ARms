var serverFPS = 40;
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	// req = request, res = result
	res.sendFile(__dirname + '/Client/index.html');
});

app.use('/Client', express.static(__dirname + '/Client/'));

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
    var playerId = player.getId();
    this.playerList[playerId] = player;
  },

  removePlayer : function(player){
    var playerId = player.getId();
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
setInterval( update, 1000/serverFPS);

function update(){
	for (var i in socketList){
		socketList[i].emit('serverInfo', PLAYER_LIST);
	}
}


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
	for (var i in socketList){
		socketList[i].emit(infoType , data);
	}
	}
	
	function disconnect(socket, data){
		var id = socket.id;
		var data = data || {};
		var type = data.type || 'has disconnected';

		var name = playerList[socket.id].name;
		delete socketList[socket.id];
   		var player = playerList[socket.id];
    	roomList.getRoom(player.getRoomID()).removePlayer(player);
		delete player;
		sendToAll('deleteinfo', {id : id});
		sendToAll('addToChat', {words : '<i> '+(name || id)+' '+ type +'</i>'});

		console.log(id, 'disconnected');
	}

	
	
});
	
	/////////////////////////////////////////////////////////////////////////////
	

	
