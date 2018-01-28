// functions for room
//roomList

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


/*
function disconnect(socket, data){
	var id = socket.id;
	var data = data || {};
	if (socket.verified){
		var type = data.type || 'has disconnected';
		if (data.type){socket.verified = false;}
		var name = PLAYER_LIST[socket.id].name;
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
		sendToAll('deleteinfo', {id : id});
		sendToAll('addToChat', {words : '<i> '+(name || id)+' '+ type +'</i>'});
	}
	console.log(id, 'disconnected');
*/
