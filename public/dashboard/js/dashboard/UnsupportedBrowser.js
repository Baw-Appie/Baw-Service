if(browser.indexOf("Chrome") == -1 && browser.indexOf("Edge") == -1 && browser.indexOf("Safari") == -1 && browser.indexOf("Firefox") == -1){
  iziToast.warning({ title: "미지원 브라우저 사용중", message: "현재 미지원 브라우저를 사용하고 있습니다. 최적의 환경을 위하여 Safari 또는 Chrome으로 접속하세요." })
  if(browser.indexOf("IE") != -1){
    if(location.href.indexOf("UnsupportedBrowser") == -1){
      if(sessionStorage.getItem('ignoreBrowserWarning') == undefined){
        location.href='https://'+hostname+'/UnsupportedBrowser'
      } else {
        iziToast.error({ title: "IE 경고 무시중", message: "임시로 IE 경고를 해제합니다." })
      }
    }
  }
}
