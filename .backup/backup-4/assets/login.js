
class Auth{
  constructor(){

    this.payload= {};

    $(document).on('submit','#form_email',function(e){
      e.preventDefault();

      auth.form = '#form_email';

      let email = $(auth.form+" input[name='email']");

      if(email.val().indexOf('@') < 0 || email.val().indexOf('.') < 2){
        email.focus();
        notif('Enter valid email');
        return ;
      }

      auth.payload={
        email :email.val()
      }
      processing(auth.form)
      ajax('api/login','POST',auth.payload,auth.login_checked)
    })




    $(document).on('submit','#form_name',function(e){
      e.preventDefault();

      let name = $("#form_name input[name='name']");
      if(name.val().length < 3){
        name.focus();
        notif('Enter your name');
        return ;
      }

      name = name.val().split(' ')[0];

      auth.payload.name = name;
      
      $('#input_holder').html(auth.get_form_code('password','password'));
      $(`#input_holder input[name='password']`).focus()
      $(`#input_holder .ninput label`).text("Create a new password");
      $(`#input_holder .actionBtn`).text("SET PASSWORD");



    })






    $(document).on('submit','#form_password',function(e){
      e.preventDefault();
      auth.form = '#form_password';

      let password = $(auth.form+" input[name='password']");

      if(password.val().length < 6){
        password.focus();
        notif('Atleast 6 characters');
        return ;
      }


      auth.payload.password = password.val();
      processing(auth.form)


      log(auth.payload);
      ajax('api/login','POST',auth.payload,auth.login_checked)
    })


  }


  load_ui(){
    $('#app').html(`<div class="tc p30 pa t50 tty-50 w100">
      <img src="img/logo-transparent.webp" class="w160p hwt">
      <div id="input_holder" class="mt80 mw400 mcen">${auth.get_form_code('email','email')}</div>
    </div>`);
  }



  get_form_code(name,type='text'){
    return `<form id="form_${name}" processing='0'>
      <div class="ninput">
        <input type="${type}" name="${name}" placeholder='.' maxlength='50'>
        <label class='ttc'>${name}</label>
      </div>
      <div class="mt50">
        <button class="but theme fat w100 actionBtn">NEXT</button>
        `+loader()+`
      </div>
    </form>`;
  }




  login_checked(r){
    log(r);
    processing(auth.form,0)

    if(r.error){
      notif(r.error);
    }
    else{
      r = r.data;

      //if account details is received then save in local
      if(r.ud){
        save_ws('ud',r.ud);
        t.details = r.ud;

        mqtt = new MqttCommunication();
        mqtt.connect();


        t.timer_send = setInterval(function(){
          if(mqtt.connected){
            clearInterval(t.timer_send);
            mqtt.send(t.details.id,{authenticated:t.details.id})
          }
        },200)

      }


      if(r.email){
        $('#input_holder').html(auth.get_form_code('email','email'));
        $(`#input_holder input[name='email']`).focus()
      }
      else if(r.name){
        $('#input_holder').html(auth.get_form_code('name'));
        $(`#input_holder input[name='name']`).focus()
      }
      else if(r.password){
        $('#input_holder').html(auth.get_form_code('password','password'));
        $(`#input_holder input[name='password']`).focus()
      }
      else if(r.dp){
        window.location = 'upload_dp';
      }
      else{

        processing(auth.form)
        
        t.timer_reload = setInterval(function(){
          if(mqtt.connected){
            clearInterval(t.timer_reload);
            window.location.reload();
          }
        },200)
      }
    }
  }



}

