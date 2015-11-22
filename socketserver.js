var io = require('socket.io')(3210);
var client = require('socket.io-client')('http://localhost:3210');
var redis = require('socket.io-redis');
var request = require('request');

// IO adapter to get messages from other senders
io.adapter(redis({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 }));

var processes_url = "http://processes-api.api-layer.djbnjack.svc.tutum.io:3000/processes"; 

var processes_socket = io.of('/processes');
processes_socket.on('connection', function(socket){
	console.log('new process connection');
	socket.emit('url', processes_url);
});

io.on('connection', function(socket) {
	console.log('new system connection');
});

client.on('updated', function(msg){
    console.log('updated: ' + msg);
    if (msg == 'processes') {
        processes_socket.emit('updated', 'all');
    }
});

client.on('system', function(msg){
    console.log('system: ' + msg);
});
