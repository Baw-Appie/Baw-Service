var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);

app.all('/', function (req, res) {
  res.send('Baw Service DashBoard Beta 4');
});

server.listen(8000, function() {
  console.log('Baw Service DashBoard(Admin Panel) server listening on port ' + server.address().port);
});
