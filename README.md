# KakaoFriendsTalk
## Korean

이 PHP 소스는 이미 등록된 전체 메시지의 테스트 발송을 이용하여 이미 친구 추가된 사용자에게 메시지를 전달할 수 있습니다.

사용 방법
	require './login.class.php';
	require './send.class.php';
	use Baw_Appie\Kakao\FriendsTalk\Login;
	use Baw_Appie\Kakao\FriendsTalk\Send;

	$object = new Login;
	$object->email = "내@카카오.계정";
	$object->password = "내카카오비밀번호";
	$object->cookie = "./kakao_cookies.txt"; // 먼저 이 파일을 생성하세요.
	$object->LoginToKakao();

	$object2 = new Send;
	$object2->phone = "내발송대상번호";
	$object2->profile = "플러스친구ID";
	$object2->message = "플러스친구메시지ID"; // 임시 저장하면 생성됩니다.
	$object2->cookie = "./kakao_cookies.txt"; // 먼저 이 파일을 생성하세요.
	$object2->SendMessage();

>다음과 같이 이용해보세요.
>>회원가입 알림, 댓글 알림, 로그인 알림

