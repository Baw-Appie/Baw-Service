function getFCMToken() {
  messaging.requestPermission().then(() => {
    messaging.getToken().then((currentToken) => {
      if(currentToken) {
        if (localStorage.getItem("FCMToken") != currentToken) {
          updateFCM(currentToken)
        }
      } else {
        iziToast.error({ title: "브라우저 알림 사용 불가", message: "인스턴스 ID 사용 불가능" })
      }
    }).catch((err) => {
      iziToast.error({ title: "브라우저 알림 사용 불가", message: "인스턴스 ID를 가져올 수 없었습니다." })
      console.log('An error occurred while retrieving token. ', err);
    })
  }).catch((err) => {
    iziToast.error({ title: "브라우저 알림 사용 불가", message: "브라우저 알림 접근이 거부되었습니다." })
    console.log('알림 권한 사용 불가.', err);
  })
}

function updateFCM(currentToken) {
  NProgress.start()
  $.ajax({
    type: "post",
    url : "/api/Browser/add",
    data : { token: currentToken },
    success : (a) => {
      if(a.success == true){
        iziToast.info({message: a.message, title: a.title})
        localStorage.setItem("FCMToken", currentToken)
      } else {
        iziToast.warning({message: a.message, title: a.title})
      }
    },
    error : () => { iziToast.warning({message: "Baw Service 빠른 설정 적용이 설정을 적용하는 도중 문제가 발생했습니다.", title:"이런.."}); }
  })
  NProgress.done()
}

getFCMToken()
