<?php
require("db.php");

if(!isset($_POST['image']) || !isset($_COOKIE['ubm'])){
	cerror("Not authorised");
}


$user_id = json_decode(decode($_COOKIE['ubm']))[0];

$data = $_POST['image'];
list($type, $data) = explode(';', $data);
list(, $data)      = explode(',', $data);

$imageName = "../img/dp/{$user_id}.jpg";
$imageData = base64_decode($data);
$source = imagecreatefromstring($imageData);
$imageSave = imagejpeg($source,$imageName,70);
imagedestroy($source);


$db = new DB();
$db->update('account', array("dp"=>'1'), array("id"=>$user_id));

res(array("ok"=>1),$db);
?>