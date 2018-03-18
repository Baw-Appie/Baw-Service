var net = require('net');

module.exports = function connectsocket(ip,port,text,callback) {
  var client = new net.Socket();
  client.connect(3203, '127.0.0.1', function() {
  	console.log('Connected');
  	client.write('pp121324;connect;say da');
  });

  client.on('data', function(data) {
  	console.log('Received: ' + data);
  	client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
  	console.log('Connection closed');
  });
}
