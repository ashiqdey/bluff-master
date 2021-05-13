let t = {
  log:1,

  ls : {
    rooms :'rooms',
    recent_players : 'recent_players',
    ud : 'ud', // user details
  }
}



let mqtt;
let auth;
let room=0;

//waiting hall
let wh=0;

//for game
let g = 0;


$(function(){

  t.loggedin = $('body').attr('loggedin');
  t.page = $('body').attr('page');

  if(t.loggedin=='0'){
    //load login script
    auth = new Auth();
    auth.load_ui();
  }
  else{
    if(t.page=='index'){

      //check if login data exists
      if(!check_ws('ud')){
        window.location='logout';
        return;
      }

      t.details = fetch_ws('ud');

      mqtt = new MqttCommunication();
      mqtt.connect();


      logout_other_device();
      
      



      if(window.location.hash!='#room'){
        window.location.hash = '#room';
      }

      get_route();
    }
    
  }


  $('.loader_warp').html(loader());
  make_notif()
})



function logout_other_device(){
  /*
  logout from other device , if same account is logged into two devices
  
  */
  //send a mqqt message to logout any other device is exists
  t.lod_timer = setInterval(function(){
    if(mqtt.connected){
      clearInterval(t.lod_timer);
      delete t.lod_timer;

      //first send message
      t.client = t.details.id+''+new Date().getTime();
      mqtt.send(t.details.id,{authenticated:t.details.id,client:t.client})

      setTimeout(function(){
        //then subscribe, after 1 sec delay
        mqtt.user_topic = 'USER/'+t.details.id;
        mqtt.subscribe(mqtt.user_topic);
      },500);

    }
  },200)
}


function getRandom(mn, mx) { 
    return Math.round(Math.random() * (mx - mn) + mn); 
}

function make_notif(){
	$('#notif_holder').html(`<div id="notif" onclick="$('#notif').attr('show','0')" class="flex aic jcsb">

	</div>`);
}
function loader(){
	return `<div class="loader"><div class="circular"><svg viewBox="25 25 50 50" class="w100"> <circle class="path" r='20' cx='50' cy='50'></circle> </svg></div></div>`
}


function processing(sel,val=1){
	$(sel).attr('processing',val);
}
/*--------------------------ajax call----------------------------*/

function ajax(url,method,data,callback){
    
    let options = {
      method: method
    }

    log("fetch ajax");
    log(url);
    
    
    if(method=="POST"){
      var formdata = new FormData();

      //for serializeArray
      if(Array.isArray(data)){
        data.map(function(e){
          formdata.append(e.name, e.value);
        });
      }
      //for object
      else{
        for(var key in data){
            formdata.append(key, data[key]);
        }
      }
      
      options.body = formdata
    }

    fetch(url, options)
    .then(response => response.json())
    .then(callback)
    .catch(error => console.log(error));
}



//display log
function log(m){
  if(t.log){
    console.log(m);
  }
}



/*---------------------ripple effect------------------*/
$(document).on("click",".ripple",function(t){$(this).css("cssText","--s: 0; --o: 1;"),$(this).offset().top,$(this).css("cssText","--t: 1; --o: 0; --d: "+2.5*(Math.max($(this).outerWidth(),$(this).outerHeight()))+"; --x:"+(t.pageX-$(this).offset().left)+"; --y:"+(t.pageY-$(this).offset().top)+";")});

/*------------------for tab component-----------------*/
$(document).on("change",".tab input",function(){$("#"+$(this).attr('name')).attr('active',$(this).val());});

/*---change attribute on  click---*/
$(document).on("click",".ca",function(){$($(this).attr("sel")).attr($(this).attr("t"),$(this).attr("v"))});



/*notification timer*/
function notif(t){
  $("#notif").attr("show","1").text(t)

  if(t.notif_timer){
    clearInterval(t.notif_timer)
  }

  t.notif_timer=setTimeout(function(){
    $("#notif").attr("show","0");
  },5e3)
}

















/*--------------------------------------------------

         router


------------------------*/
const popup_hash = [
    '#room',
    '#scorecard'
  ]


function get_route(){
  if(!popup_hash.includes(window.location.hash)){
    window.location.hash='#room';
  }

  show(window.location.hash,1)
}




$(document).on("click","a", function(e){
  let url = $(this).attr("href");
    

  if(url.indexOf('#')==0){
    e.preventDefault();

    t.forward=1;
    window.location.hash=url;

    if(popup_hash.includes(url)){
      show(url,1);
      delete t.forward;
    }
  }


});



$(document).on("touchstart",".back",function(){
  window.history.back();
});

$(document).on("click",".click_back",function(){
  window.history.back();
});




window.addEventListener('hashchange', e => {
    on_hashchanged(e.newURL, e.oldURL);
});



function forward_hash(h){
  t.forward=1;
  window.location.hash = h;
}




function on_hashchanged(new_hash,old_hash){

  //new_hash = new_hash.split('#')[1];
  old_hash = "#"+old_hash.split('#')[1];
  
  
  if(t.forward){
    delete t.forward;
  }

  //back
  else if(old_hash != undefined){

    if(popup_hash.includes(old_hash)){
      show(old_hash,0);
    }
    
  }

}







function show(ele,type){

  if(ele=='#room'){
    if(!room){
      room = new Room();
    }
    room.render_room_ui();
  }
  else{
    if(ele=='#scorecard' && g){
      g.render_scorecard()
    }


    $(ele).attr("show",type);

  }


  

}


/*--------------------------------------------------

         router

---------------------------------------------------*/















/*----save data in web storage---*/
function save_ws(key,d,session=0){
  if(!session){
    localStorage[t.ls[key]] = JSON.stringify(d);
  }else{
    sessionStorage[t.ls[key]] = JSON.stringify(d);
  }
}


/*----fetch from web storage---*/
function fetch_ws(key,session=0){
  let data = !session ? localStorage[t.ls[key]] : sessionStorage[t.ls[key]];
  return ((data) ? JSON.parse(data) : 0);
}

function check_ws(key,session=0){
  if(!session && localStorage[t.ls[key]]){
    return 1;
  }
  else{
    if(sessionStorage[t.ls[key]]){
      return 1;
    }
  }

  return 0;
}

/*----fetch from web storage---*/








