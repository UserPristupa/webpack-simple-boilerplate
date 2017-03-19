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
    // Обработчик успешного ответа
    var response = request.responseText;
    console.log(response);

    JSON.parse(response).forEach(
      function (obj) {
        //var ul = document.getElementById('using-pure-js');
        //ul.innerHTML += `<li>${obj.name} ${obj.status}</li>`;
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

function poluser() {//получение пользователей
  $.ajax({
    url: "http://mockbin.com/bin/b23dd106-4ac5-431f-baea-600457e4e834",
    type: "GET",
    success: function(response){
      // Обработчик успещного ответа
      	   // console.log(response); // Вывод содержимого ответа в консоль
      $("#from-file").empty();
      var list=$.parseJSON(response);
      $("#online_user").html(list.length);
    list.forEach(

    	      function (obj) {

    	        //$("#from-file").append(`<li>${obj.username} ${obj.status}</li>`);
              var l_i=$(`<li>${obj.username} ${obj.status}</li>`);
              $("#from-file").append(l_i);
              l_i.attr("id",`${obj.username}`);
              l_i.click(click_user);

              //document.getElementById("from-file").addEventListener("click",click_user);
    	      }
      )
    },
    error: function(data, status) {  // Обработчик ответа в случае ошибки
      	    console.error(data, status);
      	  }
  });

}
var TimeId=setInterval(poluser,1000);

var $ = require('jquery');  // Подключение установленной библиотеки jQuery

// Выполняется AJAX запрос к внешнему ресурсу c помощью jQuery
$.ajax({
  type: 'GET',
  url: 'http://mockbin.com/bin/35ea6adb-2b94-4c48-93f7-4b02b4849e3e',
  success: function(response) {  // Обработчик успещного ответа
    console.log(response); // Вывод содержимого ответа в консоль

    $.parseJSON(response).forEach(
      function (obj) {

      }
    )
  },
  error: function(data, status) {  // Обработчик ответа в случае ошибки
    console.error(data, status);
  }
});


function click_user() {
  var id_u=$(this).attr('id');
  //console.table($("#chat_"+id_u));
  var $resForm=$("[id='chat_"+id_u+"']");
  if($resForm.length==0) {
    var e = $('<div>' + id_u + ' [X]</div>');
    $('#chat_u').append(e);
    e.attr("id", "chat_" + id_u);
    e.attr("class", "chat_2");
    console.log($('#chat_1').offset().top);
   if(e.offset().top>$('#chat_1').offset().top)
    {
      console.log('New line');
     var count = $('.chat_2').length;
//     var wide=$('#chat_u').offset().left+$('#chat_u').width()-$('#chat_1').offset().left-$('#chat_1').width();
     var percent=(100/(count+1))+'%';
     $(".chat_2").each(function () {
        var that = $(this);
        that.css("width", percent);
      });
     //$("#chat_1").css("width",percent);
   //   $('.chat_2').each(function(){
     //  $(this).width(wide/count);
    // });
    }

  }
}

//document.getElementById("from-file").addEventListener("click",click_user);

