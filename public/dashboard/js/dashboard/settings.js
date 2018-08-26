$( document ).pjax( 'a', '#contents' );
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
