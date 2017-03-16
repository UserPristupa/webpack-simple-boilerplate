'use strict';

var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var router = express.Router();


let DBConnectionInstance = null;
class DB {
  constructor(dbPath = 'db.json'){

    if(!DBConnectionInstance){
          DBConnectionInstance = this;
    }

    let emptyDBFile = false;
    this.dbPath = dbPath;
    try{
      this.DBSize = fs.statSync(dbPath).size;
    }finally{
      this.storage = fs.openSync(dbPath, 'a+');
    }

    if (!this.DBSize){
      fs.writeSync(this.storage, JSON.stringify({}), 0);
    }

    return DBConnectionInstance;
  }

  _getDBData(){
    this.DBSize = fs.statSync(this.dbPath).size;
    let buffer = new Buffer(this.DBSize);
    fs.readSync(this.storage, buffer, 0, this.DBSize, 0);
    let aux = buffer.toString();
    return JSON.parse(aux);
  }

  addRecordForEntity(record, entity){
    let DBData = this._getDBData();
    if (DBData[entity] === undefined){
      DBData[entity] = [];
    }
    DBData[entity].push(record);

    const updatedDBData = JSON.stringify(DBData);
    fs.writeSync(this.storage, updatedDBData, 0);

  }

  getAllRecordsForEntity(entity){
    let DBData = this._getDBData();
    if (DBData[entity] !== undefined){
      const aux = DBData[entity];
      return aux;
    }else{
      return [];
    }
  }
}



var app = express()

var allMessages = [];
var allUsers = [];

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(function(req, res, next) {
  console.log(req.path, req.body, new Date());
  next();
});

app.get('/', function (req, res) {
    res.send(allMessages.slice(-10));
})

const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

const db = new DB("chat_db.json");

function createUserId(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);   
}

app.post('/user/register', function (request, response) {
    var user = request.body.username;

    if(!user){
      response.status(403).send({
        code: 1,
        message: "Username value is unvalid",
        field: "username"
      })
      return
    }
    const allUsers = db.getAllRecordsForEntity('users');

    let foundUser = findRecordByField('users', 'username', user)

    if (!foundUser.length){
      const userId = createUserId(user.toLowerCase());
      console.log(userId);
      db.addRecordForEntity({user_id: userId, username: user, status:'active'}, 'users')
      response.send({
        id: userId,
        username: user
      });
    }else{
      response.status(403).send({
        code: 1,
        message: "This user is already registered",
        field: "username"
      });
    }
})


function findRecordByField(entity, field, value){
  let records = db.getAllRecordsForEntity(entity);
  return records.filter( (record, index, array) => {
    if (record[field] == value){
      return record;
    }
  });
}

app.get('/user', function (request, response) {
  var res = [];
  for(var user of db.getAllRecordsForEntity('users')){
    res.push(user)
  }
  response.send(res);
})


function validateDatetime(datetime){
  if (isNaN(Date.parse(datetime))){
    return {
      message: 'Datetime is not valid. Datetime should be like 2001-01-01T01:01:01.001Z',
      field: 'datetime'
    }
  }else{
    return false;
  }
}

function validateMessageText(message){
  if (!message.message){
    return {
      message: 'Message is not valid. Message should not be empty',
      field: 'message'
    }
  }else{
    return false;
  }
}

function validateUser(user_id){
  let foundUsers = findRecordByField('users', 'user_id', user_id);
  if (!foundUsers.length){
    return {
      message: 'This user_id is not registered',
      field: 'user_id'
    }
  }else{
    return false;
  }
}

function validateChatroom(chatroom_id){
  let messages = findRecordByField('messages', 'chatroomId', chatroom_id);
  if (!messages.length){
    return {
      message: 'This chatroomId does not exist',
      field: 'chatroom_id'
    }
  }else{
    return false;
  }
}

function validateMessage(message){
  let errors = []

  error = validateDatetime(message.datetime);
  if (error){
    errors.push(error);
  }

  error = validateChatroom(message.chatroom_id);
  if (error){
    errors.push(error);
  }

  error = validateMessageText(message.message);
  if (error){
    errors.push(error);
  }

  error = validateUser(message.user_id);
  if (error){
    errors.push(error);
  }

  if (errors.length !== 0){
    return errors;
  }else{
    return true;
  }
}

function getUsersChatoorms(userId, chatrooms){

  let ownerIn = chatrooms.filter( (item, index, array) => {
    if (item['owner'] == userId){
      return true;
    }else{
      return false;
    }
  })

  let inviteeIn = chatrooms.filter( (item, index, array) => {
    if (item['invitees'].includes(userId)){
      return true;
    }else{
      return false;
    }
  })

  return {
    ownerIn: ownerIn.map( cr => cr.chatroomId),
    inviteeIn: inviteeIn.map( cr => cr.chatroomId)
  }
}

app.get('/messages', function (request, response) {

  let params = request.query;
  let messages = db.getAllRecordsForEntity('message');

  console.log(isObjectEmpty(params));
  if (!isObjectEmpty(params)){
    let startDtValidationResult = validateDatetime(params.start_datetime);
    if (startDtValidationResult){
      response.send(startDtValidationResult);
    }
    let endDtValidationResult = validateDatetime(params.end_datetime);
    if (endDtValidationResult){
      response.send(endDtValidationResult);
    }

    messages = messages.filter((message) => { 
      if (message.datetime >= params.start_datetime && message.datetime <= params.end_datetime){
        return true;
      }else{
        return false;
      }
    })

    let chatroomId = 'MAIN';
    if (params.chatroomId){
      chatroomId = params.chatroomId
    }

    messages = messages.filter((message) => { 
      if (message.chatroomId == chatroomId){
        return true;
      }else{
        return false;
      }
    })
  }

  response.send(messages);
})

app.post('/messages', function (request, response) {
    var result = validateMessage(request.body);
    if (result === true){
      db.addRecordForEntity(request.body, 'message');
      response.send(result);
    }else{
      response.status(403).send(result);
    }
})

app.post('/chatroom', function (request, response) {
    var params = request.body;

    let owner = params.owner;
    let invitees = params.invitees;

    let chatroomId = `${owner}#${invitees.join('&')}`;

    console.log(chatroomId);

    let chatroom = findRecordByField('chatroom', 'chatroomId', chatroomId);
    console.log(chatroom);
    if(chatroom.length !== 0){
      response.status(403).send({
        message: 'This chatroom already exists',
        field: 'chatroom'
      });
    }else{
      db.addRecordForEntity({owner, invitees, chatroomId}, 'chatroom');
      response.send(chatroomId);
    }
})

app.get('/chatroom', function (request, response) {
    let params = request.query;

    // let chatroomId = params.chatroom_id;
    let userId = params.user_id;

    let chatrooms = findRecordByField('chatroom', 'chatroomId', chatroomId);
    
    if(chatroom.length === 0){
      response.status(403).send({
        message: 'This chatroom does not exist',
        field: 'chatroom'
      });
    }else{

      let usersChatrooms = getUsersChatoorms(userId, chatrooms);

      response.send(usersChatrooms);
    }
})

var server = app.listen(8081, function () {
  console.log("App listening on port 8081");
})
