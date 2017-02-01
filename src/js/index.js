var users = require('./data/users');  // Подключение самостоятельно созданного модуля "users"
users.data.forEach(
  function (obj) {
    var ul = document.getElementById('from-file');
    ul.innerHTML += `<li>${obj.name} ${obj.status}</li>`;
  }
)




// Выполняется AJAX запрос к внешнему ресурсу c помощью чистого JavaScript
var request = new XMLHttpRequest();
request.open('GET', 'http://mockbin.com/bin/35ea6adb-2b94-4c48-93f7-4b02b4849e3e', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Обработчик успещного ответа
    var response = request.responseText;
    console.log(response);

    JSON.parse(response).forEach(
      function (obj) {
        var ul = document.getElementById('using-pure-js');
        ul.innerHTML += `<li>${obj.name} ${obj.status}</li>`;
      }
    )
  } else {
    // Обработчик ответа в случае ошибки
  }
};
request.onerror = function() {
  // Обработчик ответа в случае неудачного соеденения
};
request.send();




var $ = require('jquery');  // Подключение установленной библиотеки jQuery

// Выполняется AJAX запрос к внешнему ресурсу c помощью jQuery
$.ajax({
  type: 'GET',
  url: 'http://mockbin.com/bin/35ea6adb-2b94-4c48-93f7-4b02b4849e3e',
  success: function(response) {  // Обработчик успещного ответа
    console.log(response); // Вывод содержимого ответа в консоль

    $.parseJSON(response).forEach(
      function (obj) {
        $("#using-jquery").append(`<li>${obj.name} ${obj.status}</li>`);
      }
    )
  },
  error: function(data, status) {  // Обработчик ответа в случае ошибки
    console.error(data, status);
  }
});
