<?php
	//setcookie("ubm",'0', time() - 3600,'/','xbytelab.com',false);
	setcookie("ubm", '0', time() - 3600, '/');
?>
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body onload="loaded()">

<script>
function loaded(){
	localStorage.clear();
	sessionStorage.clear();
	window.location = "index";
}
</script>
</body>
</html>