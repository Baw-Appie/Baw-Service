<?php
namespace Baw_Appie\Kakao\FriendsTalk;

class Send{
	public $phone, $message, $profile, $cookie;
	function SendMessage(){
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, "https://center-pf.kakao.com/api/profiles/".$this->profile."/messages/".$this->message."/test");
		curl_setopt($ch, CURLOPT_POSTFIELDS, '{"phone_number":"'.$this->phone.'","share_flag":"true"}');
		curl_setopt($ch, CURLOPT_POST, 1);

		$headers = array();
		$headers[] = "Accept: application/json";
		$headers[] = "Accept-Encoding: gzip, deflate, br";
		$headers[] = "Accept-Language: ko,en-US;q=0.9,en;q=0.8";
		$headers[] = "User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36";
		$headers[] = "Content-Type: application/json";
		$headers[] = "Referer: https://center-pf.kakao.com/".$this->profile."/messages/".$this->message."/edit";
		$headers[] = "X-Kakao-RocketApiVersion: 4";
		$headers[] = "Origin: https://center-pf.kakao.com";
		$headers[] = "Connection: keep-alive";
		$headers[] = "Host: center-pf.kakao.com";
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_COOKIEFILE, realpath($this->cookie));
		curl_setopt($ch, CURLOPT_COOKIEJAR, realpath($this->cookie));
		curl_setopt($ch, CURLOPT_REFERER, 'https://center-pf.kakao.com/'.$this->profile.'/messages/'.$this->message.'/edit');
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);

		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close ($ch);
	}
}
?>