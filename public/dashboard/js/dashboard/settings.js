function loadSemantic() {
  $('.ui.dropdown').dropdown()
  $('.ui.checkbox').checkbox()
  $('.ui.radio.checkbox').checkbox()
}
function setNav() {
  var path = location.pathname
  $('.ui.sidebar#sidebar').sidebar('hide')
  $("a.sidebar_link").removeClass('active');
  if(path == "/"){
    $(".home_button").addClass('active');
  }
  if(path.indexOf("manage") != -1){
    $(".manage_button").addClass('active');
  }
  if(path.indexOf("API") != -1){
    $(".api_button").addClass('active');
  }
}
loadSemantic();
setNav();

$(document).pjax('a', '#contents');
$(document).on('pjax:start', () => {
  NProgress.start();
  // $("#contents").html('<div class="ui active centered inline loader"></div>')
});
$(document).on('pjax:end', () => {
  NProgress.done();
  loadSemantic()
  setNav()
});
$(document).on('pjax:error', function(xhr, textStatus, error, options) {
  if(error == "error"){
    try {
      response = JSON.parse(textStatus.responseText);
      loadScriptwithCallback("https://cdn.ravenjs.com/3.23.1/raven.min.js", function(){
        Raven.showReportDialog({
          eventId: response.sentry,
          dsn: response.dsn
        });
      })
      iziToast.error({title: '이런..', message: '페이지 로드 중 서버 오류가 발생했습니다. 버그 수정에 도움이 되도록 이 문제가 왜 발생했는지 알려주세요.'});
    } catch (error) {
      iziToast.error({title: '이런..', message: '페이지 로드 중 서버 오류가 발생했습니다.'});
    }
  } else if(error == "abort"){
    iziToast.info({title: '흠..?', message: '페이지 로드 요청이 취소되었습니다.'});
  } else if(error == "timeout"){
    iziToast.error({title: '젠장..', message: '페이지 로드를 로드하는데 시간이 너무 많이 걸려서 로드할 수 없습니다.'});
  } else {
    console.log(error)
    iziToast.error({title: '앗!', message: '페이지 로드에 오류가 있어요. 새로고침이 도움이 될거에요!'});
  }
  return false;
});
$.pjax.defaults.timeout = 1200

$('.uk-offcanvas .link').click(() => { UIkit.offcanvas('#navbar').hide(); })
if(location.protocol != "https:"){
  iziToast.error({ title: "보안 경고!", message: "Baw Service 연결에 HTTPS가 사용되지 않고 있습니다. 정상적으로 Baw Service에 접근하지 않았거나 해커가 Baw Service의 접속 방법을 바꿨을 수 있습니다."})
  iziToast.error({ title: "보안 경고!", message: "HTTPS를 사용하지 않으면 Baw Service와 사용자의 통신이 암호화되지 않아 중간에 해커가 데이터를 가로챌 수 있습니다."})
  iziToast.error({ title: "보안 경고!", message: "또한, Service Worker가 작동하지 않음으로 브라우저 푸쉬 등 여러가지 기능 사용에 문제가 발생할 수 있습니다."})
  iziToast.warning({
    title: "보안 경고!",
    message: "HTTPS를 사용하여 다시 연결하려면 버튼을 클릭하세요.",
    buttons: [
        ['<button>HTTPS 활성화</button>', function (instance, toast) {
            location.replace("https://baws.kr")
        }, true]
    ]
  })
}

if(localStorage.getItem("LastVersion") == undefined){
  localStorage.setItem("LastVersion", version)
  console.log("버전 설정됨")
}
if(localStorage.getItem("LastVersion") != version) {
  $('#contents').prepend(`
<div id="updater" class="ui basic modal">
  <div class="ui icon header">
    <i class="archive icon"></i>
    Baw Service Updater
  </div>
  <div class="content">
    <p>Baw Service를 `+version.substring(0, 7)+`으로 성공적으로 업데이트했습니다!<br>
    Baw Service의 변경 사항을 확인하시려면 <a href="https://gitlab.com/Baw-Dev/Baw-Service/commits/master">[여기]</a>로 접속해주세요.</p>
    <p>Baw Service를 이용해주셔서 감사합니다.</p>
  </div>
  <div class="actions">
    <div class="ui green ok inverted button">
      <i class="checkmark icon"></i>
      계속
    </div>
  </div>
</div>
  `);
  $("#updater").modal('show');
  localStorage.setItem("LastVersion", version)
  console.log("버전 업데이트됨")
}

function post(path, params, method) {
  method = method || "post";
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);
  for(var key in params) {
    if(params.hasOwnProperty(key)) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

Kakao.init('4976c5aa590cf204b6b27a95f06b5769');
function plusFriendChat() {
  Kakao.PlusFriend.chat({
    plusFriendId: '_xixfxmGC'
  });
}
