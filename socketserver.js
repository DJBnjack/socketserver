var io = require('socket.io')(3210);
var redis = require('socket.io-redis');
var request = require('request');

// IO adapter to get messages from other senders
io.adapter(redis({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 }));

var processJson = "";
var updateProcesses = function(callback) {
    var url = "http://processes-api.core.djbnjack.svc.tutum.io:3000/processes";
    // var url = "http://localhost:3000/processes";
    request(url, function (error, response, body) {
        if(error){
            console.log('Error:', error);
        } else if(response.statusCode !== 200){
            console.log('Invalid Status Code Returned:', response.statusCode);
        }
    
        processJson = body;
        if (callback != null) callback(processJson);
    });    
}

// Initial load of processes
updateProcesses();

var processes = io.of('/processes');
processes.on('connection', function(socket){
	console.log('new process connection');
	socket.emit('processes', processJson);
});

io.on('connection', function(socket) {
	console.log('new system connection');
});

io.on('updated', function(msg){
    console.log('updated: ' + msg);
    if (msg == 'processes') {
        updateProcesses((updatedProcesses) => processes.emit('processes', updatedProcesses));
    }
});

io.on('system', function(msg){
    console.log('system: ' + msg);
});
