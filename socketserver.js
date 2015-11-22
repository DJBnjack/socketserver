var io = require('socket.io')(3210);
var client = require('socket.io-client')('http://localhost:3210');
var redis = require('socket.io-redis');
var request = require('request');

var redis_url = 'redis.core.djbnjack.svc.tutum.io:6379';
var neo4j_url = 'http://neo4j.core.djbnjack.svc.tutum.io:8080';
var statsd_url = 'http://statsd.core.djbnjack.svc.tutum.io:8081';
var processes_url = "http://processes-api.api-layer.djbnjack.svc.tutum.io:3000/processes"; 
var url_collection = {
    'redis_url': redis_url,
    'neo4j_url': neo4j_url,
    'statsd_url': statsd_url
}

// IO adapter to get messages from other senders
io.adapter(redis(redis_url));

var processes_socket = io.of('/processes');
processes_socket.on('connection', function(socket){
	console.log('new process connection');
	socket.emit('url', processes_url);
});

io.on('connection', function(socket) {
	console.log('new system connection');
    io.emit('urls', url_collection);
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
