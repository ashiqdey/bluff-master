<?php
require('db.php');
$db = new DB();







if(isset($_POST['name']) && isset($_POST['email']) && isset($_POST['password'])){

	$name = ucwords(substr($db->escape($_POST['name']), 0,15));
	$email = $db->escape($_POST['email']);
	$password = md5(SALT.$_POST['password']);


	if($name==""){
		cerror("Name is required",$db);
	}
	else if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		cerror("Invalid email",$db);
	}
	 

	//check if account exists
	$account_created = $db->insert('account',array('email'=>$email,'name'=>$name,'password'=>$password));

	if($account_created){
		set_login($account_created,$name);
		$user_details = array(
			'id' => (int)$account_created,
			'name' => $name
		);
		res(array('dp'=>'Upload profile photo', 'ud'=>$user_details),$db);
	}

	cerror("Failed to create account",$db);
}





else if(isset($_POST['email']) && isset($_POST['password'])){

	$email = $db->escape($_POST['email']);


	//check if account exists
	$account = $db->select('account','*',"email='$email'",1);

	if(!$account){
		cerror("Account doest exist",$db);
	}
	else{

		if($account->password != md5(SALT.$_POST['password'])){
			cerror("Wrong password",$db);
		}
		
		set_login($account->id,$account->name);

		$user_details = array(
			'id' => (int)$account->id,
			'name' => $account->name
		);
		
		//if not dp then upload dp
		if($account->dp === NULL){
			res(array('dp'=>'Upload profile photo', 'ud'=>$user_details),$db);
		}
	}

	res(array('ok'=>1, 'ud'=>$user_details),$db);
}





else if(isset($_POST['email'])){
	$email = $db->escape($_POST['email']);

	//check if valid email
	if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		cerror("Invalid email",$db);
	}

	//check if account exists
	$account = $db->select('account','id,name',"email='$email'",1);

	if($account){
		if($account->name != NULL){
			res(array('password'=>'Enter password'),$db);
		}
	}

	res(array('name'=>'Enter name'),$db);
}









function set_login($user_id,$name){

	//setcookie("ubm", encode(json_encode(array($user_id,$name))), time() + 864000,'/','xbytelab.com',false);
	setcookie("ubm", encode(json_encode(array($user_id,$name))), time() + 864000, '/');
}








?>