<?php
require './login.class.php';
require './send.class.php';
use Baw_Appie\Kakao\FriendsTalk\Login;
use Baw_Appie\Kakao\FriendsTalk\Send;

$object = new Login;
$object->email = "Your@kakao.account";
$object->password = "YourKakakoPassword";
$object->cookie = "./kakao_cookies.txt"; // Please create this file first. 
$object->LoginToKakao();

$object2 = new Send;
$object2->phone = "YourPhoneNumber";
$object2->profile = "YourPlusFriendsID";
$object2->message = "YourPlusFriendsMessageID";
$object2->cookie = "./kakao_cookies.txt"; // Please create this file first. 
$object2->SendMessage();