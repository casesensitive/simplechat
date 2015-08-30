var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function findClientsSocket(roomId, namespace) {
	'use strict';
	var res = []
	, ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(id);
				}
			} else {
				res.push(id);
			}
		}
	}
	return res;
}

function checkArrValue(arr, value) //ASSOCIATIVE ARRAYS
{
	'use strict';
	for(var key in arr){
		if(arr[key] == value){
			return key;
		}
		else{
			return false;
		}
	}
}

var users = {};
var anons = 0;
var anonsArr = [];

function autoClean(){
	'use strict';
	console.log(">Executing scheduled cleaning...");
	var socks = findClientsSocket();
	for(var k in users){
		if(socks.indexOf(users[k]) == -1){
			console.log(">>Removing user "+k);
			delete users[k];
			io.emit("user unlogin", k);
		}
	}
	console.log(">Clean!");
}

app.get('/', function(req, res){
	'use strict'; 
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	'use strict'; 
	console.log('a user connected');
	socket.on('disconnect', function(){
		var a = anonsArr.indexOf(socket.id);
		if(a != -1){
			anonsArr.splice(a, 1);
			anons--;
			io.emit("user unlogin", "Anonymous");
			console.log("Anonymous disconnected");
		}
		else{
			a = checkArrValue(users, socket.id);
			if(a != false){
				console.log(a+" disconnected");
				io.emit("user unlogin", a);
				delete users[a];
			}
			else {
				console.log("unknown disconnection, calling cleaning");
				autoClean();
			}
		}
	});
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
	socket.on('user login', function(msg){
		if (msg == "Anonymous"){
			anons++;
			io.emit("new anonymous user", anons);
			anonsArr.push(socket.id);
			for (var k in users){
				socket.emit("userlist", k);
			}
		}
		else if (!(msg in users)){
			users[msg] = socket.id;
			socket.emit("user confirmation", msg);
			io.emit("user login", msg);
			var a = anonsArr.indexOf(socket.id);
			if (a == -1){
				console.log("ERROR: User trying to leave anonymity without being Anonymous");
			}
			anons--;
			anonsArr.splice(a, 1);
			io.emit("user unlogin", "Anonymous");
			socket.emit('anonlist', anons);
		}
		else{
			socket.emit("user confirmation", 0);
		}
	});
});

http.listen(3000, function(){
	'use strict'; 
	console.log('listening on *:3000');
	setInterval(function(){autoClean()}, 60000);
});

