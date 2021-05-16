
class Room{
  constructor(){

    this.rooms=[];

    $(document).on('submit','#form_create_room',function(e){
      e.preventDefault();
      sfx.selected();
      room.create_room();
    })

    $(document).on('submit','#form_join_room',function(e){
      e.preventDefault();
      sfx.selected();
      room.join_room();
    })

    $(document).on('click','.join_room',function(){
      sfx.mgs();
      room.join_room(0,$(this).attr('room-id'));
    })




  }



  create_room(r=0){
    if(!r){
      room.form = '#form_create_room';

      let room_id = $(room.form+" input[name='room_id']");

      if(room_id.val().length < 6){
        room_id.focus();
        notif('At leaast 6 characters expected');
        return ;
      }

      processing(room.form)
      ajax('api/room','POST',{create:room_id.val()},room.create_room);
    }
    else{
      processing(room.form,0)

      if(r.error){
        notif(r.error);
      }
      else if(r.data){
        if(r.data.item){
          room.active_room(r.data.item);
        }
      }
    }

  }


  


  join_room(r=0,join=0){
    if(!r){
      let payload={join:1}

      if(room.joining){
        return;
      }

      if(!join){
        room.form = '#form_join_room';

        let room_id = $(room.form+" input[name='room_id']");

        if(room_id.val().length < 6){
          room_id.focus();
          notif('At leaast 6 characters expected');
          return ;
        }

        payload.room_name = room_id.val();
      }
      else{
        payload.room_id = join;
        //show text
        $(`.join_room[room-id='${join}']`).html('...');

      }


      room.joining = 1;
      processing(room.form)
      ajax('api/room','POST',payload,room.join_room)
    }
    else{
      processing(room.form,0)
      delete room.joining;

      if(r.error){
        notif(r.error);
      }
      else if(r.data){
        if(r.data.item){
          room.active_room(r.data.item);
        }
      }
    }

  }








  render_room_ui(){
    $('#app').html(`
    <div class="p20 mw400 mcen">


      <div class="tab_holder  mw400 mcen bsllg" id="tab_1" active="1">
        
        <div class="tab">
          <div class="warp m3 w100 br8 tc f08 bold" style="background:#2F3263">
            <label class="ripple mr10 z5">
              <input type="radio" name="tab_1" value="1" checked>
              <div class="text ttu">Recent</div>
            </label>
            <label class="ripple mr10 z5">
              <input type="radio" name="tab_1" value="2">
              <div class="text ttu">Create</div>
            </label>
            <label class="ripple mr10 z5">
              <input type="radio" name="tab_1" value="3">
              <div class="text ttu">Join </div>
            </label>

            
        
            <div class="deco pa theme z0 br8 l0 b0 h100 w33 tr4"></div>
          </div>
        </div>


        <div class="tab_body ">
          
        <!--recent room-->
          <div class="warp">
            <div id="recent_rooms" rooms='0'>
              <div class="whitebg br10 mt20">
                <div class="p10 wrap"></div>
                <!--hr>
                <div class="p10 o6 f08 tc">SHOW ALL</div-->
              </div>
            </div>
          </div>
          <!--end recent room-->


          <!--create room-->
          <div class="warp">
            <div class='h200 hwt'></div>
            <form id="form_create_room" class='mt50' processing='0'>
              <div class="ninput">
                <input type="text" name="room_id" placeholder='.' maxlength='15' autocomplete="off" class='ttu'>
                <label>Room ID</label>
              </div>
              <div class="mt50">
                <button class="but red fat w100 actionBtn">CREATE ROOM</button>
                `+loader()+`
              </div>
            </form>
          </div>
          <!--end create room-->


          <!--join room-->
          <div class="warp">
            <div class='h200 hwt'></div>
            <form id="form_join_room" class='mt50' processing='0'>
              <div class="ninput">
                <input type="text" name="room_id" placeholder='.' maxlength='15' autocomplete="off" class='ttu'>
                <label>Room ID</label>
              </div>
              <div class="mt50">
                <button class="but aqua fat w100 actionBtn">JOIN ROOM</button>
                `+loader()+`
              </div>
            </form>
          </div>
          <!--join room-->


        </div>
      </div>




    </div>`);


    room.render_recent_rooms();
  }



  render_recent_rooms(render_count=3,rooms=[]){
    /*
    fetch from cache and render the UI, according to requested childs
    */
    if(check_ws('rooms')){
      rooms = fetch_ws('rooms');

      $('#recent_rooms').attr('rooms',rooms.length);
      $('#recent_rooms .wrap').html(rooms.map(make).join(''));

      function make(e,i){
        if(i<render_count){
          return `<div class="flex jcsb aic p10">
            <div class="w60 lc1">${e.name}</div>
            <button class="but mbut theme join_room" room-id='${e.id}'>Join room</button>
          </div>`;
        }
        else{
          return '';
        }
      }
    }


    if(rooms.length == 0){
      //take to join room
      $("#tab_1 input[value='3']").prop('checked',true);
      $("#tab_1").attr('active','3');

      $('#recent_rooms .wrap').html("<div class='tc'><div class='h70'></div><img src='img/ufo.svg' class='w150p'><div class='h70 o6'>Recent rooms will be displayed here</div></div>");

    }

    
  }



  save_rooms(room_data,rooms=[]){
    /*
    save recent rooms in cache
    */
    if(!room_data.id || !room_data.name)return;

    if(check_ws('rooms')){
      rooms = fetch_ws('rooms');
    }

    //filter the array, to remove the room if exists
    rooms = rooms.filter((e)=>{
      return e.id!=room_data.id;
    })

    let payload = {id:room_data.id,user:room_data.user,name:room_data.name};

    rooms.unshift(payload);
    save_ws('rooms',rooms);
  }






  active_room(room_data){

    log('--- room.js active_room');


    //open the active room
    //save the active room in localstorage
    
    t.active_room = room_data;
    room.save_rooms(room_data);

    //take to waiting hall
    forward_hash('waiting_hall')


    //make room topic
		mqtt.room_topic = 'ROOM/'+t.active_room.id;
	
		//start listning from all members of this room
		mqtt.subscribe(mqtt.room_topic);


    //render waiting hall
    if(!wh){
      wh = new Waiting_hall();
    }
    wh.render_waiting_hall();

  }





}




