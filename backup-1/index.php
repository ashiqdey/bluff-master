<?php
$loggedin = isset($_COOKIE['ubm'])?1:0;

?>
<!DOCTYPE html>
<html>
<head>
	<title>Bluff Master - Login</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
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

.bs3f{box-shadow:0 0 0 3.5px #fff inset}
.bs3opp{box-shadow:0 0 0 3.5px #828894 inset}


.rot-40{transform:rotate(-40deg)}


.card {position: relative;width:30px;}
.card div{position: absolute;width:200%;top:0;left:0;}



/*-----playing table------*/
#table{top:55px;height:calc(100% - 300px);}
#table .border{height:calc(100% - 20px);width:calc(100% - 20px);top:10px;left:10px;border-radius:20px;}
#table .border_bg{background-image:linear-gradient(#d1b36e 21%,#816e40 50%,#ffdf95);height:150%;width:150%;top:-25%;left:-25%;}
#table .border_bg[animate='1']{animation:rotate180 18s infinite linear}
#table .carpet{background-image:radial-gradient(#3C44A3,#1F2561);height:calc(100% - 20px);width:calc(100% - 20px);top:10px;left:10px;border-radius:12px;}

#oldcards{position:absolute;top:20px;left:20px;}
#oldcards .card{width:15px;}
#oldcards .card div{width:250%;}
#cards_on_table_count{top:10px;right:10px;border:2px solid #c5cdec;background:#fff;}

#latest_card{width:100%;top:60%}
#latest_card .card {width:25px;height:100px}

#user_played{bottom:25px;left:25px;}
#user_played .name{bottom: -14px;width: 80px;left: -15px;}
/*-----playing table------*/




/*-----card window------*/
#card_window{height:240px;}
#card_window .progress{height:3px;width:100%;}
#card_window .progress>div{height:3px;background:#25E979;}

#card_window[show='1']{height:345px;background:#373E57;z-index:4;}
#card_window[show='1'] .progress>div{display:block;width:100%;animation:width100 15s}
#card_window[show='1'] .form_self_turn{display:block;}

#card_window[show='1'] .card{width:35px}

#cards_chooseable{height:140px;}
#cards_chooseable input:checked ~ .img_holder{box-shadow:0 0 0 5px rgb(14,238,252,.4)}
#cards_chooseable input:checked ~ .img_holder:before{content:'';position:absolute;height:100%;width:100%;top:0;left:0; background:rgb(14,238,252,.15);}

#cards_chooseable .img_holder:after{content: attr(card-no);position: absolute;top: 7px;left: 7px;font-size: 21px;color: #4b4b4b;font-weight: 700}
#cards_chooseable input:checked ~ .img_holder:after{color: #027abd;}



#card_no_chooser .text{border:2px solid #575f76;border-radius:6px;font-weight:700;font-size:1.2em;}
#card_no_chooser input:checked ~ .text{border:2px solid #fff;background:#fff;color:var(--darkbg)}
/*-----card window------*/






/*-----player badge------*/
#players .player:before{content:attr(count);background:#fff;height:28px;width:28px;border-radius:40px;position:absolute;top:-8px;right:-9px;display:flex;align-items:center;justify-content:center;font-size:0.8em;border:2px solid var(--darkbg);color:var(--darkbg);font-weight:500;z-index:2;}


#players svg circle{stroke-dasharray:295,295;stroke-dashoffset:295;opacity:0;}
#players .player[active='1'] svg circle{stroke-dashoffset:0;stroke:red;animation: timer_circle 10s linear;opacity:1;}


@keyframes timer_circle{
	0%{stroke-dashoffset:283;stroke:#1CEAA5}
	50%{stroke-dashoffset:140;stroke:#1CEAA5}
	100%{stroke-dashoffset:0;stroke:red}
}





@media (min-width:900px){
	#table{width:calc(40% - 20px);left:60%;height:calc(100% - 180px);top:70px;}
	#card_window{width:60%;}
	#card_window[show='1']{box-shadow:0;height:100%}

	#card_window .card {width:45px;}

	#card_window{height:calc(100% - 80px);}
	#cards_chooseable{height:calc(100% - 200px);}
	#cards_chooseable label{height:160px;}
	#cards_chooseable .flex{flex-wrap: wrap;}

	#card_no_chooser .text{height:45px;width:45px;}
	#card_no_chooser .text:hover{background:rgba(255,255,255,0.08);}
}

</style>



<div id="app"></div>
<div id="notif_holder"></div>


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



