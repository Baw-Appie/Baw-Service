function error2(text){
  iziToast.warning({title: "후원 기록 확인에 실패했습니다.", message: text})
}
function HistoryLookupCheck(){
  var du = document.history;
  if(!du.nick.value){
    error2('닉네임를 입력해주세요.');
    du.nick.focus();
    return false;
  }
  var v = grecaptcha.getResponse(1);
  if(v.length == 0)
  {
    error2('정말로 로봇인가요?');
    return false;
  }
  return true;
}
$("#history").submit(function(){
  var ok = HistoryLookupCheck();
  if (ok == true) {
    var formdata=$("#history").serialize();
    var url=`https://${hostname}/manage/1/lookup`;
    $.ajax({
        type: "post",
        url : url,
        data : formdata,
        success : function s(a){
          console.log(a)
          if(a.success == true) {
            $("#view").html("<b>" + a.message + "원</b>");
            // $("#view").html("<img src=\"https://visage.surgeplay.com/full/" + document.TRM.nick.value + "\"><b>" + a.message + "원</b>");
          } else {
            error(a.message)
          }
        },
        error : function error(a){ error2('후원 로그 조회 서비스에 접근할 수 없습니다.') }
    });
  }
  grecaptcha.reset(1)
  return false;
})
