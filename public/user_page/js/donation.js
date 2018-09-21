$(function() {
    $(".pin").keyup (function () {
        var charLimit = $(this).attr("maxlength");
		var du = document.TRM;
        if (this.value.length >= charLimit) {
		  var inputs = $(this).closest('form').find(':input');
		  inputs.eq( inputs.index(this)+ 1 ).focus();
        }
    });
});

function onlyNumber(event){
	event = event || window.event;
	var keyID = (event.which) ? event.which : event.keyCode;
	if ( (keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 9 || keyID == 46 || keyID == 37 || keyID == 39 )
		return;
	else
		return false;
}
function removeChar(event) {
	event = event || window.event;
	var keyID = (event.which) ? event.which : event.keyCode;
	if ( keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 )
		return;
	else
		event.target.value = event.target.value.replace(/[^0-9]/g, "");
}
function error(text){
  iziToast.warning({title: "후원에 실패했습니다.", message: text})
}

function blank_up(){
    var du = document.TRM;

    if(!du.nick.value){
		error('닉네임 입력해주세요.');
        du.nick.focus();
        return false;
    }
    if(!du.bal.value){
        error('후원 금액을 입력해주세요.');
        du.bal.focus();
        return false;
    }

  if(du.Combo.value !== "계좌이체"){
		if(du.Combo.value !== "틴캐시"){
			if($("[name=pin1]")[0].value == ""){
				error('핀번호1를 입력해주세요..');
				$("[name=pin1]")[0].focus();
				return false;
			}
			if($("[name=pin2]")[0].value == ""){
				error('핀번호2를 입력해주세요..');
		   $("[name=pin2]")[0].focus();
				return false;
			}
			if($("[name=pin3]")[0].value == ""){
				error('핀번호3를 입력해주세요..');
				$("[name=pin3]")[0].focus();
				return false;
			}
			if(!du.pin4.value){
				error('핀번호4를 입력해주세요..');
				du.pin4.focus();
				return false;
			}
		}

		if(du.Combo.value == "틴캐시"){
			if($("[name=pin1]")[1].value == ""){
				error('틴캐시 핀번호를 입력해주세요..');
				$("[name=pin1]")[1].focus();
				return false;
			}
			if($("[name=pin2]")[1].value == ""){
				error('틴캐시 핀번호를 입력해주세요..');
				$("[name=pin2]")[1].focus();
				return false;
			}
			if($("[name=pin3]")[1].value == ""){
				error('틴캐시 핀번호를 입력해주세요..');
				$("[name=pin3]")[1].focus();
				return false;
			}
		}
	}

  if(du.Combo.value == "후원수단선택"){
		if(!du.nname.value){
			error('후원 수단을 선택하세요.');
			du.nname.focus();
			return false;
		}
  }
  if(du.Combo.value == "계좌이체"){
		if(!du.nname.value){
			error('입금자를 입력해주세요..');
			du.nname.focus();
			return false;
		}
	}

	var v = grecaptcha.getResponse();
     if(v.length == 0)
    {
        error('정말 로봇이 맞으신가요?');
        return false;
    }
	if(du.Combo.value == "해피머니" || du.Combo.value == "도서문화상품권"){
		if(!du.code.value) {
			error('발행일 또는 인증코드를 입력해주세요!');
			return false;
		}
	}
	return true;
}

var rgx1 = /\D/g;
var rgx2 = /(\d+)(\d{3})/;

function getNumber(obj){

     var num01;
     var num02;
     num01 = obj.value;
     num02 = num01.replace(rgx1,"");
     num01 = setComma(num02);
     obj.value =  num01;

}

function setComma(inNum){

     var outNum;
     outNum = inNum;
     while (rgx2.test(outNum)) {
          outNum = outNum.replace(rgx2, '$1' + ',' + '$2');
      }
     return outNum;
}
$(function() {
    var du = document.TRM;
	$("#Combo").change( function() {
		if(du.Combo.value == "계좌이체"){
			$(".nn").slideDown(500);
			$(".ncombo").slideUp(500);
			$("#ninfo").slideDown(500);
		}
		if(du.Combo.value !== "계좌이체"){
			$(".nn").slideUp(500);
			$(".ncombo").slideDown(500);
			$("#ninfo").slideUp(500);
		}
		if(du.Combo.value == "틴캐시"){
			$(".teen").slideDown(500);
			$(".normal").slideUp(500);
		}
		if(du.Combo.value !== "틴캐시"){
			$(".normal").slideDown(500);
			$(".teen").slideUp(500);
		}
		if(du.Combo.value !== "도서문화상품권" || du.Combo.value !== "해피머니"){
			$(".code").slideUp(500);
		}
		if(du.Combo.value == "해피머니" || du.Combo.value == "도서문화상품권"){
			$(".code").slideDown(500);
			var text = document.getElementById("code_text");
			var input = document.getElementById("code");
			if(du.Combo.value == "해피머니"){
				text.innerText = "인증코드";
        if( typeof(disable_placeholder) == 'undefined' )
				    input.setAttribute("placeholder", "인증코드");
			}
			if(du.Combo.value == "도서문화상품권"){
				text.innerText = "발행일";
        if( typeof(disable_placeholder) == 'undefined' )
				    input.setAttribute("placeholder", "발행일");
			}
		}
	});
});
$(document).ready(function()
{
	$(".teen").hide();
	$(".nn").hide();
	$("#ninfo").hide();
	$(".code").hide();
});

function captchaSubmit() {
	var ok = blank_up();
    if (ok == true) {
		$("#TRM").submit();
    } else {
        grecaptcha.reset();
    }
}
