<?php
namespace Baw_Appie\Kakao\FriendsTalk;

class Login{
	public $email, $password, $cookie;
	function LoginToKakao(){
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, "https://accounts.kakao.com/weblogin/authenticate");

		curl_setopt($ch, CURLOPT_POSTFIELDS, "type=w&continue=https%3A%2F%2Fcenter-pf.kakao.com%2Fsignup&email=".$this->email."&password=".$this->password."&callback_url=https%3A%2F%2Faccounts.kakao.com%2Fcb.html&scriptVersion=1.4.2");
		curl_setopt($ch, CURLOPT_POST, 1);


		$headers = array();
		$headers[] = "Cache-Control: max-age=0";
		$headers[] = "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
		$headers[] = "Accept-Encoding: gzip, deflate, br";
		$headers[] = "Accept-Language: ko,en-US;q=0.9,en;q=0.8";
		$headers[] = "User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36";
		$headers[] = "Content-Type: application/x-www-form-urlencoded";
		$headers[] = "Referer: https://accounts.kakao.com/login?continue=https://center-pf.kakao.com/signup";
		$headers[] = "Origin: https://accounts.kakao.com";
		$headers[] = "Upgrade-Insecure-Requests: 1";
		$headers[] = "Connection: keep-alive";
		$headers[] = "Host: accounts.kakao.com";
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_COOKIEFILE, realpath($this->cookie));
		curl_setopt($ch, CURLOPT_COOKIEJAR, realpath($this->cookie));
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close ($ch);
	}
}