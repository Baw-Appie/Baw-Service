window.onload = function () {
  //var url = location.href
  //$.pjax({url: url, container: '#pjax'})
  //toastr.info('Baw Service Dashboard Beta 4 초기 설정중..', '환영합니다!');
}
$( document ).pjax( 'a', '#contents' );
$(document).on('pjax:start', function() { NProgress.start(); });
$(document).on('pjax:end',   function() { NProgress.done();  });


$(document).on('pjax:error',   function() { toastr.error('Baw Service 페이지 로드 가속을 이용하여 페이지를 로드하는 도중 오류가 발생했습니다.', '죄송합니다!');return false;  });

$('.uk-offcanvas .link a').click(() => { UIkit.offcanvas('#navbar').hide(); })
