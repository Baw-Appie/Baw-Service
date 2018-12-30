var net = require('net');
module.exports = (port,ip,text,callback) => {
  var client = new net.Socket();
  client.connect(port, ip, () => {
    client.write(text)
    client.end()
  })
  client.on('data', callback)
  client.on('error',() => console.log("Error.."))
}