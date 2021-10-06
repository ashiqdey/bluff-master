<?php
require('db.php');
$db = new DB();

if(!isset($_COOKIE['xtk'])){
	cerror("Not authorised");
}

$user_id = decode($_COOKIE['xtk']);
$user_id = explode(".",$user_id)[1];


if(isset($_POST['start'])){
	$room_id = strtoupper($db->escape($_POST['start']));

	if(strlen($room_id) < 6) {
		cerror("Room ID should be have 6 characters or above",$db);
	}
	else if(strlen($room_id) > 15) {
		cerror("Room ID should be less than 15 characters",$db);
	}


	//check if account exists
	$is_room_exists = $db->select('rooms','id,name,status',"name='$room_id'",1);
	if($is_room_exists){
		cerror("Room ID already exists",$db);
	}

	$room = $db->insert('rooms',array('user'=>$user_id,'name'=>$room_id));


	res(array('mgs'=>'Room created',"item"=>array("id" => $room,"name"=>$room_id)),$db);
}






else if(isset($_POST['join'])){
	$room_id = $db->escape($_POST['join']);
	$room = $db->select('rooms','*',"name='$room_id'",1);
	if(!$room){
		cerror("Room doesn't exists",$db);
	}


	//if this is the admin, then mark room as 'can_join'
	if($room->user == $user_id){
		$db->update('rooms',array('status'=>'can_join'),array('id'=>$room->id));
	}

	//if not admin then check if room status == 'can_join'
	else{
		if($room->status!='can_join'){
			cerror("You can only join when admin is in waiting hall",$db);
		}
	}


	res(array('mgs'=>'Room available for joining',"item"=>$room),$db);
}



else if(isset($_POST['close'])){
	$room_id = $db->escape($_POST['close']);
	$room = $db->select('rooms','*',"user='$user_id' AND name='$room_id'",1);
	if(!$room){
		cerror("Room doesn't exists",$db);
	}


	$db->update('rooms',array('status'=>'closed'),array('id'=>$room->id));


	res(array('mgs'=>'room closed'),$db);
}




?>