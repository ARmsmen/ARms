var getID;
function init(){
	socket = io();
	socket.on("serverMsg", function(msg){
		console.log("Hello World from Server");
	});
	var btn = document.querySelector("#abc");
	
	getID = function(){
		socket.emit("buttonPress", {data: "data from client"});
		console.log("Sent data from client");
	};
	
}