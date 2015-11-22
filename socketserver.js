var io = require('socket.io')(3210);
var client = require('socket.io-client')('http://localhost:3210');
var redis = require('socket.io-redis');
var request = require('request');

// IO adapter to get messages from other senders
io.adapter(redis({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 }));

var processes = [];
var updateProcesses = function(callback) {
    var url = "http://processes-api.api-layer.djbnjack.svc.tutum.io:3000/processes";
    // var url = "http://localhost:3000/processes";
    request(url, function (error, response, body) {
        if(error){
            console.log('Error:', error);
        } else if(response.statusCode !== 200){
            console.log('Invalid Status Code Returned:', response.statusCode);
        }
    
        processes = body;
        if (callback != null) callback(processes);
    });    
}

// Initial load of processes
updateProcesses();

var processes_socket = io.of('/processes');
processes_socket.on('connection', function(socket){
	console.log('new process connection');
	socket.emit('processes', processes);
});

io.on('connection', function(socket) {
	console.log('new system connection');
});

client.on('updated', function(msg){
    console.log('updated: ' + msg);
    if (msg == 'processes') {
        updateProcesses((updatedProcesses) => processes_socket.emit('processes', updatedProcesses));
    }
});

client.on('system', function(msg){
    console.log('system: ' + msg);
});
