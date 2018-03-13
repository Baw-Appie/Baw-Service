var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);

app.all('/', function (req, res) {
  res.send('Welcome Baw Service DashBoard');
});

server.listen(8000, function() {
  console.log('Baw Service DashBoard(Admin Panel) server listening on port ' + server.address().port);
});
