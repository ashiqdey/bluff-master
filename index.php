<?php
$loggedin = isset($_COOKIE['ubm'])?1:0;
?>
<!DOCTYPE html>
<html>
<head>
	<title>Bluff Master</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,user-scalable=no">
	<link rel="apple-touch-icon" sizes="57x57" href="img/logo/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="img/logo/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="img/logo/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="img/logo/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="img/logo/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="img/logo/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="img/logo/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="img/logo/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="img/logo/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192"  href="img/logo/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="img/logo/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="img/logo/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="img/logo/favicon-16x16.png">
	<link rel="manifest" href="/manifest.json">
	<meta name="msapplication-TileColor" content="#373E57">
	<meta name="msapplication-TileImage" content="img/logo/ms-icon-144x144.png">
	<meta name="theme-color" content="#373E57">
	<link rel="stylesheet" type="text/css" href="assets/home.css">
</head>
<body loggedin='<?= $loggedin?>'  page='index'>


<style type="text/css">

#splash[show='0']{left:-100%;transition:0.4s;}

.blink{animation:blink 0.5s linear;}

@keyframes blink{
	0%,40%,80%{opacity:1;}
	20%,60%,100%{opacity:0.3;}
}
</style>



<div id="app"></div>


<div id="splash" class="pf h100 w100 z9000 t0 l0">
	<div class="pa t50 l0 w100 tty-50 tc">
		<img src="img/logo-transparent.webp" class="logo w150p">
	</div>
</div>






<div id="notif" onclick="$('#notif').attr('show','0')" class="flex aic jcsb"></div>


<audio id="audio_start" src="sound/start.ogg" style="display: none;"></audio>
<audio id="audio_selected" src="sound/selected.ogg" style="display: none;"></audio>
<audio id="audio_bluffed" src="sound/bluffed.ogg" style="display: none;"></audio>
<audio id="audio_lose" src="sound/lose.ogg" style="display: none;"></audio>
<audio id="audio_win" src="sound/win.ogg" style="display: none;"></audio>
<audio id="audio_message" src="sound/mgs.ogg" style="display: none;"></audio>


<script src="assets/vendor/jquery.min.js"></script>
<script src="assets/vendor/paho-mqtt.min.js"></script>
<script src="assets/mqtt.js"></script>
<script src="assets/login.js"></script>
<script src="assets/room.js"></script>
<script src="assets/waiting_hall.js"></script>
<script src="assets/game.js"></script>
<script src="assets/common.js"></script>


</body>
</html>



