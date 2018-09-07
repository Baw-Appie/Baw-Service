loadScriptwithCallback('https://smartlock.google.com/client', () => {

  const retrievePromise = googleyolo.retrieve({
  supportedAuthMethods: [
    "googleyolo://id-and-password",
    "https://accounts.google.com"
  ],
  supportedIdTokenProviders: [
    {
      uri: "https://accounts.google.com",
      clientId: clientId
    }
  ]
  });
  retrievePromise.then((credential) => {
    if(location.href.indexOf("auth/login") == -1){
      if (credential.password) {
        iziToast.info({ title: "자동 로그인중", message: "Google Smart Lock을 사용하여 자동 로그인하는중.." })
        post('https://'+hostname+'/auth/login', {id: credential.id, pass: credential.password})
      } else {
        iziToast.info({ title: "자동 로그인 거부됨", message: "구글 로그인을 사용할 수 없습니다. ("+credential.idToken+")" })
      }
    } else {
      iziToast.info({ title: "자동 로그인 거부됨", message: "무한 자동 로그인을 방지하기 위해서 현재 페이지에서는 자동 로그인할 수 없습니다." })
    }
  }, (error) => {
    console.log(error)
    if (error.type === 'noCredentialsAvailable') {
      iziToast.info({ title: "자동 로그인 거부됨", message: "사용 가능 계정을 찾을 수 없습니다." })
    }
  });

})
