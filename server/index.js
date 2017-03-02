var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var router = express.Router();


var app = express()

var allMessages = [];
var allUsers = [];

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
    res.send(allMessages.slice(-10));
})

app.post('/user/register', function (request, response) {
    console.log(request.body, new Date());

    var user = request.body.username;

    if (allUsers.indexOf(user) == -1){
      allUsers.push(user);
      response.send({
        id: user,
        username: user
      });
    }else{
      response.status(403).send({
        code: 1,
        message: "This user is registered already",
      });
    }
})

app.get('/user', function (request, response) {
  console.log(request.path, request.body, new Date());

  var res = [];
  for(var user of allUsers){
    res.push({user_id: user, username: user, status: "active"})
  }
  response.send(res);
})

app.get('/messages', function (request, response) {
  console.log(request.body, new Date());

  var res = [];
  for(var message of allMessages){
    res.push(message)
  }
  response.send(res);
})

app.post('/messages', function (request, response) {
    console.log(request.body, new Date());

    allMessages.push(request.body);
    response.send(request.body);
})


var server = app.listen(8081, function () {
  console.log("App listening on port 8081");
})
