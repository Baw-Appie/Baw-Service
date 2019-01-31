loadScriptwithCallback('https://smartlock.google.com/client', () => {

  if (location.href.indexOf("auth") == -1 && typeof (disableAutoLogin) == 'undefined') {
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
      if (credential.password) {
        iziToast.info({ title: "돌아오신것을 환영합니다!", message: credential.id + "으로 로그인 중.." })
        post('https://' + hostname + '/auth/login/callback', { id: credential.id, pass: credential.password })
      } else {
        iziToast.info({ title: "자동 로그인 거부됨", message: "아직 자동 구글 로그인을 사용할 수 없습니다. (" + credential.idToken + ")" })
      }
    }, (error) => {
      console.log(error)
    })
  }
})
