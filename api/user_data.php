<?php
require('db.php');
$db = new DB();

if(!isset($_COOKIE['xtk']) || !isset($_POST['d'])){
	cerror("Not authorised");
}

$user_id = decode($_COOKIE['xtk']);
$user_id = explode(".",$user_id)[1];


$account = $db->select('account','id,name,dp',"id='$user_id'",1);
if(!$account){
	cerror("Not authorised");
}

res($account,$db);
?>