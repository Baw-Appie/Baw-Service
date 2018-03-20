module.exports = function connectsocket(port,ip,text,callback) {
  var net = require('net');
  var client = new net.Socket();
  client.connect(port, ip, function() {
  	client.write(text);
    client.end();
  });

  client.on('data', callback);
  client.on('error', function(){});
}
