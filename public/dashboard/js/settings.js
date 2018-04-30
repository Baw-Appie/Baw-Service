$( document ).pjax( 'a', '#contents' );
$(document).on('pjax:start', function() { NProgress.start(); });
$(document).on('pjax:end',   function() { NProgress.done();  });
$(document).on('pjax:error',   function() { iziToast.error({title: '이런..', message: 'Baw Service 페이지 로드 가속을 이용하여 페이지를 로드하는 도중 오류가 발생했습니다.'}); return false;  });
$.pjax.defaults.timeout = 1200

toastr.options = {
		  "closeButton": false,
		  "debug": false,
		  "newestOnTop": false,
		  "progressBar": false,
		  "positionClass": "toast-bottom-right",
		  "preventDuplicates": false,
		  "onclick": null,
		  "showDuration": "300",
		  "hideDuration": "1000",
		  "timeOut": "5000",
		  "extendedTimeOut": "1000",
		  "showEasing": "swing",
		  "hideEasing": "linear",
		  "showMethod": "fadeIn",
		  "hideMethod": "fadeOut"
		}

$('.uk-offcanvas .link').click(() => { UIkit.offcanvas('#navbar').hide(); })
$('.link a').click(() => {
  $(".link a").removeClass('uk-active');
  $(this).addClass('uk-active');
})
