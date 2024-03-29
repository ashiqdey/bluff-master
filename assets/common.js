let t = {
  log:1,
  rendered : [],
  ls : {
    rooms :'rooms',
    recent_players : 'recent_players',
    ud : 'ud', // user details
    splash : 'splash'
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

  t.loggedin = parseInt($('body').attr('loggedin'));
  t.page = $('body').attr('page');

  if(!t.loggedin){
    //load login script
    load_login_ui();



  }
  else{
    if(t.page=='index'){

      //check login
      //save data
      get_loggedin_data()


      if(window.location.hash!='#room'){
        window.location.hash = '#room';
      }

      get_route();

      a2hsinit();
    }
    
  }

  /*------------splash------------------*/
  if(check_ws('splash',1)){
    $('#splash').remove()
  }
  else{
    setTimeout(()=>{$('#splash').attr('show','0');},2000)
    setTimeout(()=>{$('#splash').remove()},2600)
    save_ws('splash',{splash:1},1)
  }


})



function logout(){
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'logout';
}


function get_loggedin_data(r=0){
  if(!r){
    //if available in cahce do nothing
    if(check_ws('ud')){
      user_data_found()
      return;
    }

    ajax('api/user_data','POST',{d:'error'},get_loggedin_data)
  }
  else{
    log(r);

    if(r.error){
      log("error");
      logout()
      return;
    }


    //if account details is received then save in local
    if(r.data.id){

      if(r.data.name){
        r.data.name = r.data.name.split(" ")[0];
      }
      save_ws('ud',r.data);
      user_data_found(r.data);
    }
    else{
      log("id not found");
      logout()
    }

  }


  function user_data_found(ud=0){
    if(!ud){
      t.details = fetch_ws('ud');
    }
    else{
      t.details = ud;
    }
    


    //first send message
    t.client = t.details.id+''+new Date().getTime();
    mqtt = new MqttCommunication();
    mqtt.connect();




    t.timer_send = setInterval(function(){
      if(mqtt.connected){
        clearInterval(t.timer_send);
        delete t.timer_send;

        //logout same account from other devices
        mqtt.user_topic = 'USER/'+t.details.id;
        mqtt.send(mqtt.user_topic,{authenticated:t.details.id,client:t.client})


        //subsscribe to user topic
        mqtt.subscribe(mqtt.user_topic);
      }
    },200)
  }
}




function load_login_ui(){
  $('#app').html(`<div class="tc p30 pa t50 tty-50 w100">
    <img src="img/logo-transparent.webp" class="w160p hwt">
    <div id="input_holder" class="mt80 mw400 mcen">

      <a href='https://xbytelab.com/account/google?redirect=https://xbytelab.com/game/bluffmaster/' class='db mt50'><button class="but white w100 flex jcc f1 cgrey7 aic"><img src='icon/google.svg' class='ic30 mr10'><span>Login with google</span></button></a>

      <a href='https://xbytelab.com/account/facebook?redirect=https://xbytelab.com/game/bluffmaster/' class='db mt50'><button class="but theme w100  flex jcc f1 white aic" style='background: #405dff;'><img src='icon/fb.svg' class='ic30 mr10'><span>Login with Facebook</span></button></a>

      <a href='https://xbytelab.com/account/twitter?redirect=https://xbytelab.com/game/bluffmaster/' class='db mt50'><button class="but theme w100  flex jcc f1 white aic" style='background:#03a9f4;'><img src='icon/twitter.svg' class='ic30 mr10'><span>Login with Twitter</span></button></a>

    </div>
  </div>`);
}









function getRandom(mn, mx) { 
    return Math.round(Math.random() * (mx - mn) + mn); 
}


function loader(size='40px',stroke='var(--theme)'){
  return `<div class="loader" style='width:${size};height:${size};'><div class="circular"><svg viewBox="25 25 50 50" class="w100"> <circle class="path" r='20' cx='50' cy='50' stroke='${stroke}'></circle> </svg></div></div>`
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
    '#scorecard',
    '#more',
    '#chat'
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
  log("haschanged");

  //new_hash = new_hash.split('#')[1];
  old_hash = "#"+old_hash.split('#')[1];
  

  log(old_hash);

  
  if(t.forward){
    delete t.forward;
  }

  //back
  else if(old_hash != undefined){


    if(popup_hash.includes(old_hash)){
      log("show 0 -> 1 "+old_hash);

      show(old_hash,0);
    }
    else{
      log("show 0 -> 2 "+old_hash);
    }
    
  }
  else{
    log("show 0 -> 3 "+old_hash);
  }

}







function show(ele,type){
  log(`-----show ${ele} ${type}`);



  if(ele=='#room'){
    if(!room){
      room = new Room();
    }
    room.render_room_ui();
  }
  else{
    if(ele=='#scorecard' && type && g.render_scorecard){
      g.render_scorecard();
    }
    else if(ele=='#more' && type && g.render_more){
      g.render_more()
    }
    else if(ele=='#chat' && type && g.render_chat){
      g.render_chat()
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








function getPWADisplayMode() {
  log("Is full screen");
  log(window.matchMedia('(display-mode: fullscreen)').matches);

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if (navigator.standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}

//trash the beforeinstallprompt event
 function a2hsinit(){
    window.addEventListener('beforeinstallprompt', function(e){
      e.preventDefault();
      console.log('beforeinstallprompt fired');
      if(e.prompt){
        window.deferredPrompt = e;
        return false;
      }
    });
}

//trigger deferredPrompt to allow the user install PWA
function install(){
  deferredPrompt.prompt();
}
