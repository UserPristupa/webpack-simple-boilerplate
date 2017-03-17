'use strict';

const express = require('express');
const fs = require("fs");
const bodyParser = require('body-parser');
const router = express.Router();

const DEFAULT_CHATROOM = 'MAIN';

let DBConnectionInstance = null;
class DB {
  constructor(dbPath){

    if(!DBConnectionInstance){
          DBConnectionInstance = this;
    }

    let emptyDBFile = false;
    this.dbPath = dbPath;
    try{
      this.DBSize = fs.statSync(dbPath).size;
    }catch (err){
      if (err.code === 'ENOENT') {
        console.log('Database does not exist. Creating the new one...');
      }
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
    fs.writeFileSync(this.dbPath, updatedDBData);

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

function findRecordByField(entity, field, value){
  let records = db.getAllRecordsForEntity(entity);
  return records.filter( (record, index, array) => {
    if (record[field] == value){
      return record;
    }
  });
}

function createUserId(username){
  return Math.abs(username.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)); 
}

const isObjectEmpty = (obj) => Object.keys(obj).length === 0;


var app = express()

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

function validateDatetimeForFuture(datetime){
  if (Date.parse(datetime) > new Date()){
    return {
      message: 'Datetime is not valid. Datetime should not be greated than current moment',
      field: 'datetime'
    }
  }else{
    return false;
  }
}

function validateMessageText(message){
  if (!message){
    return {
      message: 'Message is not valid. Message should not be empty',
      field: 'message'
    }
  }else{
    return false;
  }
}

function validateUser(user_id){
  const foundUsers = findRecordByField('user', 'user_id', user_id);
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
  if (chatroom_id){
    const messages = findRecordByField('chatroom', 'chatroom_id', chatroom_id);
    if (messages.length === 0){
      return {
        message: 'This chatroom_id does not exist',
        field: 'chatroom_id'
      }
    }else{
      return false;
    }
  }else{
    return false;
  }
}

function validateMessage(message){
  let errors = [];
  let error = {};

  if (message.datetime){
    error = validateDatetime(message.datetime);
    if(!error){
      error = validateDatetimeForFuture(message.datetime);
      if (error){
        errors.push(error);
      }
    }else{
      errors.push(error);
    }
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
    if (item['invitees'].includes(Number(userId))){
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


const db = new DB("chat_db.json");


app.get('/', function (req, res) {
    res.send(db.getAllRecordsForEntity('message').slice(-10));
})


app.post('/users/register', function (request, response) {
    const username = request.body.username;
    const usernameLower = username.toLowerCase();

    if(!username){
      response.status(403).send({
        code: 1,
        message: "Username value is not valid. Username should not be empty",
        field: "username"
      })
      return
    }
    const allUsers = db.getAllRecordsForEntity('user');

    const userId = createUserId(usernameLower);
    const foundUser = findRecordByField('user', 'user_id', userId)

    if (!foundUser.length){
      db.addRecordForEntity({user_id: userId, username: username, status:'active'}, 'user')
      response.send({
        id: userId,
        username: username
      });
    }else{
      response.status(403).send({
        code: 1,
        message: "This user is already registered",
        field: "username"
      });
    }
})


app.get('/users', function (request, response) {
  var res = [];
  for(var user of db.getAllRecordsForEntity('user')){
    res.push(user)
  }
  response.send(res);
})


app.post('/messages', function (request, response) {
    let params = request.body;
    let validationResult = validateMessage(request.body);

    if (!params.chatroom_id){
      params.chatroom_id = DEFAULT_CHATROOM;
    }

    if (validationResult === true){
      db.addRecordForEntity(params, 'message');
      response.send(validationResult);
    }else{
      response.status(403).send(validationResult);
    }
})


app.get('/messages', function (request, response) {

  let params = request.query;
  let messages = db.getAllRecordsForEntity('message');

  if (params.start_datetime && params.end_datetim){
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
  }

  let chatroom_id = DEFAULT_CHATROOM;
  if (params.chatroom_id){
    chatroom_id = params.chatroom_id
  }

  console.log(chatroom_id, 1);

  messages = messages.filter((message) => { 
    console.log(message.chatroom_id, 2);
    if (message.chatroom_id == chatroom_id){
      return true;
    }else{
      return false;
    }
  })
  

  response.send(messages);
})


app.post('/chatroom', function (request, response) {
    var params = request.body;

    let owner = params.owner;
    let invitees = params.invitees;
    let name = params.name;

    let chatroom_id = `${owner}-${invitees.join('-')}`;

    if (!name){
      name = chatroom_id;
    }

    console.log(chatroom_id);

    let chatroom = findRecordByField('chatroom', 'chatroom_id', chatroom_id);
    console.log(chatroom);
    if(chatroom.length !== 0){
      response.status(403).send({
        message: 'This chatroom already exists',
        field: 'chatroom'
      });
    }else{
      db.addRecordForEntity({owner, invitees, chatroom_id, name}, 'chatroom');
      response.send({chatroom_id: chatroom_id, name});
    }
})

app.get('/chatroom', function (request, response) {
    let params = request.query;

    let userId = params.user_id;

    let chatrooms = db.getAllRecordsForEntity('chatroom');


      let usersChatrooms = getUsersChatoorms(userId, chatrooms);

      response.send(usersChatrooms);
    
})

var server = app.listen(8081, function () {
  console.log("App listening on port 8081");
})
