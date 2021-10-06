<?php
define('SALT','43gretertgerteyi9jesojwhruinsdfrtert45');


function db_conn(){
	$mysqli = new mysqli("localhost","root","","bluff_master");
	
	//finnovationz.com
    //$mysqli = new mysqli("localhost","finnova_user1","(bse09@BSE47.2gP2)","finnova_mf_b2b_test");

	if ($mysqli -> connect_errno) {
		die("Failed to connect to MySQL: " . $mysqli -> connect_error);
	}
	return  $mysqli;
}



function encode($string){
	return openssl_encrypt($string, "AES-256-CBC", "(25Z6cFq35b-9M79XblRf2-13Z6jb0f)",false,"5fI1ld0oOo36FpD0");
}
function decode($string){
	return openssl_decrypt($string, "AES-256-CBC", "(25Z6cFq35b-9M79XblRf2-13Z6jb0f)",false,"5fI1ld0oOo36FpD0");
}


function cerror($mgs,$db=0,$code=201){
	if($db){$db->close();}
	$data = array("error"=>$mgs,"code"=>$code);
	die(json_encode($data));
}

function res($r,$db=0){
	if($db){$db->close();}
	$data = array("data"=>$r);
	die(json_encode($data));
}







class DB {
	public function __construct() {
		$this->db_conn = db_conn();
	}
	public function close() {
		$this->db_conn->close();
	}
	public function escape($d) {
		return mysqli_real_escape_string($this->db_conn,$d);
	}

	public function delete($table,$where) {
		$db = $this->db_conn;

		if($db->query("DELETE FROM {$table} WHERE {$where}") === TRUE){
			return 1;
		}else{
			return 0;
		}
	}


	public function select($table,$col,$where,$single=0) {

		$result = $this->db_conn->query("SELECT {$col} FROM {$table} WHERE {$where}");
		$results = [];
		if($result->num_rows !=null){
			while ( $row = $result->fetch_object()) {

				if($single){
					return $row;
				}

				$results[] = $row;
			}

			return $results;
		}else{
			return 0;
		}

	}






	/*------insert------*/
	public function insert($table, $data, $format='s') {
		$db = $this->db_conn;

		$format = str_repeat('s',count($data));

		list( $fields, $placeholders, $values ) = $this->prep_query($data);
		array_unshift($values, $format); 
		$stmt = $db->prepare("INSERT INTO {$table} ({$fields}) VALUES ({$placeholders})");
		call_user_func_array( array( $stmt, 'bind_param'), $this->ref_values($values));
		$stmt->execute();
		
		if ($stmt->affected_rows){
			return $stmt->insert_id;
		}
		
		return false;
	}
	/*------insert------*/




	public function update($table, $data, $where) {
		$db = $this->db_conn;

		$format = str_repeat('s',(count($data)+count($where)));

		list( $fields, $placeholders, $values ) = $this->prep_query($data, 'update');
		$where_clause = '';
		$where_values = [];
		$count = 0;
		foreach ( $where as $field => $value ) {
			if ( $count > 0 ) {
				$where_clause .= ' AND ';
			}
			$where_clause .= $field . '=?';
			$where_values[] = $value;
			$count++;
		}
		array_unshift($values, $format);
		$values = array_merge($values, $where_values);
		$stmt = $db->prepare("UPDATE {$table} SET {$placeholders} WHERE {$where_clause}");
		call_user_func_array( array( $stmt, 'bind_param'), $this->ref_values($values));
		$stmt->execute();
		if ( $stmt->affected_rows ) {
			return true;
		}
		return false;
	}



	



	




	



	private function prep_query($data, $type='insert') {
		$fields = '';
		$placeholders = '';
		$values = array();
		foreach ( $data as $field => $value ) {
			$fields .= "{$field},";
			$values[] = $value;
			if ( $type == 'update') {
				$placeholders .= $field . '=?,';
			} else {
				$placeholders .= '?,';
			}
		}
		$fields = substr($fields, 0, -1);
		$placeholders = substr($placeholders, 0, -1);
		return array( $fields, $placeholders, $values );
	}


	private function ref_values($array) {
		$refs = array();
		foreach ($array as $key => $value) {
			$refs[$key] = &$array[$key]; 
		}
		return $refs; 
	}
}

?>