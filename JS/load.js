var name = String();
var socket = io();
var anons = 0;
name = "Anonymous";
socket.emit('user login', name);

$('#chat').submit(function(){
	socket.emit('chat message', '['+name+'] '+$('#m').val().replace(/</g, "&lt;").replace(/>/g, "&gt;"));
	$('#m').val('');
	return false;
});
$('#newname').submit(function(){
	socket.emit('user login', $('#n').val().replace(/</g, "&lt;").replace(/>/g, "&gt;"));
	return false;
});
socket.on('chat message', function(msg){
	msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	$('#messages').append($('<li>').text(msg));
	$('html, body').animate({ scrollTop: $('#messages').height()}, 20);
});
socket.on('user login', function(msg){
	msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	$('#users').append($('<li class="'+msg+'">').text(msg));;
});
socket.on('userlist', function(msg){
	msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	$('#users').append($('<li class="'+msg+'">').text(msg));;
});
socket.on('user confirmation', function(msg){
	if(msg != 0){
		name = msg;
		$('#newname').remove();
	}
});
socket.on('anonlist', function(msg){
	if (typeof(msg) == "number"){
		$('#Anonymous').html('Anonymous['+msg+']');
		anons = msg;
	}
});
socket.on('new anonymous user', function(msg){
	if (typeof(msg) == "number"){
		$('#Anonymous').html('Anonymous['+msg+']');
		anons = msg;
	}
});
socket.on('user unlogin', function(msg){
	if(msg == "Anonymous"){
		anons--;
		$('#Anonymous').html('Anonymous['+(anons)+']');
	} 
	else{
		msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		var a = '.'+msg;
		$(a).remove();
	}
});
