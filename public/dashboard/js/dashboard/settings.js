$(document).pjax('a', '#contents');
$(document).on('pjax:start', function() { NProgress.start(); });
$(document).on('pjax:end', function() { NProgress.done(); });
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
      iziToast.error({title: '이런..', message: '페이지 로드 중 오류가 발생했습니다. 어떤 작업 도중 이 문제가 발생했는지 알려주세요. 버그 수정에 도움이 됩니다.'});
    } catch (error) {
      iziToast.error({title: '이런..', message: '페이지 로드 중 서버 오류가 발생했습니다.'});
    }
  } else if(error == "abort"){
    iziToast.info({title: '흠..?', message: '페이지 로드 요청이 취소되었습니다.'});
  } else {
    iziToast.error({title: '이런..', message: '페이지 로드 중 알 수 없는 오류가 발생했습니다.'});
  }
  return false;
});
$.pjax.defaults.timeout = 1200

$('.uk-offcanvas .link').click(() => { UIkit.offcanvas('#navbar').hide(); })
$('.link a').click(() => {
  $(".link a").removeClass('uk-active');
  $(this).addClass('uk-active');
})
if(localStorage.getItem("LastVersion") == undefined){
  localStorage.setItem("LastVersion", version)
  console.log("버전 설정됨")
}
if(localStorage.getItem("LastVersion") != version) {
  $('#contents').prepend(`
<div id="updater" uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
        <h2 class="uk-modal-title">Baw Service Updater</h2>
        <p>Baw Service를 `+version.substring(0, 7)+`으로 성공적으로 업데이트했습니다!<br>
        Baw Service의 변경 사항을 확인하시려면 <a href="https://gitlab.com/Baw-Dev/Baw-Service/commits/master">[여기]</a>로 접속해주세요.</p>
        <p>Baw Service를 이용해주셔서 감사합니다.</p>
        <button class="uk-button uk-button-primary" type="button">완료</button>
    </div>
</div>
  `);
  UIkit.modal("#updater").show();
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
