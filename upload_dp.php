<?php
if(!isset($_COOKIE['ubm'])){
	header("location:index");
	exit();
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Upload profile pic</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
	<link rel="stylesheet" type="text/css" href="assets/home.css">
	<link rel="stylesheet" href="assets/induvidual/croppie.css" />
</head>
<body loggedin='1' page='upload_dp'>

<style>
#upload_btn{background:rgba(0, 196, 245, 1);color:#fff;}

#loading_bar prog{height:3px;background:rgba(255,255,255,0.2);display:block;}
#loading_bar child{height:3px;background:var(--theme);display:block;}
#loading_bar child{animation:width80 15s linear;width:90%}
@keyframes width80{
	0%{width:0%;}
	100%{width:80%;}
}

#btn_holder[show-upload='0']>*{width:100%!important}
#btn_holder:not([show-upload='1']) #upload_btn{display:none;}
</style>



<div class="tc p30 pa t50 tty-50 w100">
	<div class="container mw400 mcen">
		<div><div id="image"></div></div>
		<div class="flex m2 mt50 jcsb" id='btn_holder' show-upload='0'>
			<label class='pr cp db mr10'>
				<input type="file" id="img_selector" class="p10 pa o0 w100 z5">
				<button class="but w100 z0 pr theme select_image">SELECT IMAGE</button>
			</label>
			<button id="upload_btn" class="cp but m1l0 aqua" onclick="upload()">UPLOAD</button>
		</div>
		<div id="loading_bar" class='w100 p10 mt100' style='display:none'><prog><child></child></prog></div>

		<a href="index">
			<button class="but w100 z0 pr redl mt30">SKIP</button>
		</a>


	</div>
</div>


<div id="notif_holder"></div>


<script src="assets/vendor/jquery.min.js"></script>
<script src="assets/vendor/croppie.min.js"></script>
<script src="assets/common.js"></script>
<script>
var inst;
$(function(){
  inst = $('#image').croppie({
    enableExif: true,
    viewport: {
          width: 100,
          height: 100,
          type: 'circle'
      },
      showZoomer: false,
      boundary: {
          width: 150,
          height: 150
      },
      url: 'img/default_dp.svg'
  });
})




/*-----file selector--------*/
$('#img_selector').on('change', function (){ 
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('#image').croppie('bind', {
        url: e.target.result
      });
    }
    image_selected=1;
    reader.readAsDataURL(this.files[0]);

    $("#btn_holder").attr('show-upload','1');
    $(".select_image").text('CHANGE')
  }
});
/*-----file selector--------*/


function upload(){

  $('#btn_holder').hide();
  $('#loading_bar').show();

	inst.croppie('result', {
		type: 'canvas',
		size: 'viewport',
		format:'jpeg',
		circle:false
	}).then(function (resp) {
 
		$.ajax({
			url: "api/upload_dp",
			type: "POST",
			data: {"image":resp},
			success: function (j) {
		        console.log(j);
		        j = JSON.parse(j);
		        
				if(j.error){
					notif(j.error);
				}
				else if(j.data){
					window.location = 'index';
				}
			}
		});
	});
}

</script>
</body>
</html>



