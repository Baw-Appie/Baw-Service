importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
importScripts('/firebase_init.js');

const messaging = firebase.messaging();

// messaging.onMessage(function(payload) {
  // console.log('Message received. ', payload);
  // alert("새로운 알림이 있습니다.")
  // iziToast.info({ title: "새 후원이 있습니다!", message: "지금 바로 데이터 관리로 이동해서 새 후원을 확인하세요!" })
// });

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  var notificationTitle = 'Baw Service 알림';
  var notificationOptions = {
    body: '음.. 무언가가 도착했어요!',
    icon: '/public/img/favicon.jpg'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
