module.exports = function connectsocket(port,ip,text,callback) {
  var net = require('net');

  var client = new net.Socket();
  client.connect(port, ip, function() {
  	client.write('connect;pp121324;say Hello!');
    client.end();
  });

  client.on('data', callback);
}
