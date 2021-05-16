<?php
require('db.php');
$db = new DB();


//DdCFVnuTQIQyArsoabmxZQ%3D%3D
$user_id = json_decode(decode($_COOKIE['ubm']))[0];
echo $user_id;


?>