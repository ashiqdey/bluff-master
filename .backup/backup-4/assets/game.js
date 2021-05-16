

class Sfx{
  start(){
    $("#audio_start")[0].play();
  }
  selected(){
    $("#audio_selected")[0].play();
  }
  lose(){
    $("#audio_lose")[0].play();
  }
  bluffed(){
    $("#audio_bluffed")[0].play();
  }
  win(){
    $("#audio_win")[0].play();
  }
  mgs(){
    $("#audio_message")[0].play();
  }
}

let sfx = new Sfx();












class Game{
  constructor(){

    this.winners={};
    
    this.players_subscribed=[];
    

    this.turn_time=20;//15 sec

    this.next_call_delay = 2;//allow 2 sec delay to start the next turn


    //round will start when clicked this button
    $(document).on('click','#start_round',function(){
			$('#start_round_wrap').hide();
      sfx.selected()
			mqtt.send(mqtt.host_topic,{game:{start_round:1}})
		})



    $(document).on('submit','#card_window',function(e){
      e.preventDefault();
    })

    $(document).on('click','#game_pass',function(e){
      e.preventDefault();
      sfx.mgs();
      g.i_pass();
    })

    $(document).on('click','#game_put',function(e){
      e.preventDefault();
      sfx.mgs();
      g.put_card();
    })



    $(document).on('click','#bluff',function(){
			$(this).hide();
			g.bluff();
		})


    $(document).on('change',"#card_window input[name='selected_cards']",function(){
      sfx.selected()
			g.auto_Select_call($(this).val());
		})

    

    $.getScript('assets/vendor/party.min.js', function() {
      t.sparkles_event = {
        clientX: (window.innerWidth / 2),
        clientY:  (window.innerHeight / 2),
        pageX: (window.innerWidth / 2),
        pageY:  (window.innerHeight / 2),
        offsetX: 0,
        offsetY: 0,
      }
    });

  }
  
  

  render_game(){

    g.my_cards=[];
    g.cards_with_players={};


    $('#app').html(`<div id='main_game' class="pf t0 l0 w100 h100">

    <div class="progress">
              <div class='dn'></div>
          </div>


        <div id="players" class="pf z3 w100 t0 l0 flex z5">
          <div class="me p15 w80p"></div>
          <div class="opponennts w-80 ">
              <div class="ofxa w100 tscroll">
                <div class='flex p15 opponennt_players'></div>
              </div>
          </div>
        </div>

        <div id="table" class="pf w100 p10 z10">
          <div class="border p10 pa ofh">
              <div class="carpet pa p10">
                <div class='pa w100 tc t50 l50 tt-50 z5 dn' id='start_round_wrap'>
                    <div class="tc">Round <span class='round_no'></span></div>
                    <button id='start_round' class='but fat theme mt20'>TAP TO START</button>
                </div>
                
                <div id="cards_on_table_count" class="pa ic30 cgrey7 br30 ic f08 bolder">0</div>
                <div id="latest_card" class="pa l50 t50 w100 tt-50 flex jcc"></div>
                <div id="user_played" class="pa t10 tc"></div>
                <div id="users_call" class="pa w100p tc l50 t0 ttx-50 p10 bold f12 flex aic jcc"></div>
                <div id="bluff_cta" class="pa">
                    <button class="but ic70 bsc db p8_30" id='bluff' style="background-image: url('img/bluff-btn.webp'); display: none;"></button>
                </div>

                <div id="oldcards" class="flex pa b10 l10 "></div>

                <div id="bluff" show='0' class="pa h100 w100 z9000 t0 l0"></div>

              </div>
          </div>
        </div>



        <form id="card_window" class="pf l0 w100 b0" show='0' mini='0'>
          
          <div class="form_self_turn dn card_no_chooser_wrap pt10">
              <div id='card_no_chooser' class="flex fww plr10 cgrey9"></div>
          </div>
          <div class="ofxa w100 tscroll" id="cards_chooseable">
              <div class="flex p15 wrap"></div>
          </div>
          <div class="form_self_turn dn">
              <div class="flex aic m2 jcsb p15 pt0 mw400 mcen">
                <button class="but mr10 red" id="game_pass">PASS</button>
                <button class="but ml10 theme" id="game_put">PUT</button>
              </div>
          </div>
        </form>



        <div class="ribbon flex aic darkbg jcsb p10 pf flex w100 b0 l0">
          <div class="flex aic">
              <span class="o6 ml10">Round - <span class='round_no'></span></span>
          </div>

          <div class="flex aic">
            <div id='' class='ml10'>
              <a href="#mic" class="ic40 ic p5 black01 br50 ix-mic"></a>
            </div>
            <div id='' class='ml10'>
              <a href="#chat" class="ic40 ic p5 black01 br50 ix-chat"></a>
            </div>
            <div id='open_scorecard' class='dn ml10'>
              <a href="#scorecard" class="ic40 ic p5 black01 br50 ix-trophy"></a>
            </div>
            <div id='' class='ml10'>
              <a href="#more" class="ic40 ic p5 black01 br50 ix-3dot"></a>
            </div>

          </div>
          <div id='chat_received' class='pf z5 black cgrey7 f08 br10'></div>
        </div>


        <div id='scorecard' class='overlay pf t0 w100 h100 l0 z4000' show='0'></div>
        <div id="more" class="overlay pf t0 w100 h100 l0 z4000" show="0"></div>
        <div id="winner" show='0' class="pf h100 w100 z9000 t0 l0 black06"></div>
        

    </div>`);


    
    
    if(t.host){
      g.init_round();
    }
    



    /*--------render the card choosing buttons----------*/
    const card_symbols = ['2','3','4','5','6','7','8','9','10','A','J','K','Q']
    $("#card_no_chooser").html(card_symbols.map(e=>`<label class="p5 pr cp"> <input type="radio" name="call" value="${e}" class="pa o0"> <div class="text ic35 ic">${e}</div> </label>`).join(''));

    g.render_players()


  }







  render_more(){
    if(t.rendered.includes('more'))return;
    t.rendered.push('more');

    $('#more .wrap').html(`<div class="mask back mt"></div>
    <div class="mask click_back sw"></div>
    <div class="darkbg wrap w100 mw400 mcen pa b0 l50 ttx-50 brt20 ofh">
      
      <div class="p20 flex jcsb aic whitebg">
        <div class="flex aic">
          <a href='upload_dp' class="ic40 greyd br50 pr bs3opp bsc" style="background-image:url(img/dp/${t.details.id}.jpg)">
            <div class="ix-edit ic20 pa ic br20 greyc f06 b0 r0 ic"></div>
          </a>
          <div class="f11 cgrey5 ml10">${t.details.name}</div>
        </div>
      </div>
  
      <div class="p10">
        <div id="exit_room" class="flex aic p10">
          <div class="ic30 whitebg br50 ic f08 cgrey9 ix-exit_room"></div>
          <div class="f11 cgrey5 ml10 cgrey9">Exit room</div>
        </div>
        <div id="logout" class="flex aic p10">
          <div class="ic30 whitebg br50 ic f08 cgrey9 ix-logout"></div>
          <div class="f11 cgrey5 ml10 cgrey9">Logout</div>
        </div>
      </div>
    </div>`);


    $(document).on('click','#exit_room',function(){
      g.exit_room();
    });
    $(document).on('click','#logout',function(){
      g.logout();
    });
  }


  
  exit_room(id=0){
    if(!id){
      //send message to all 
      mqtt.send(mqtt.game_topic,{
        game:{
          exit_room : t.details.id
        }
      });

      //unsubscribe from rooom topi
      mqtt.unsubscribe(mqtt.game_topic);

      //remove all data from g
      delete g.winners;
      delete g.scorecard;
      delete g.round;
      delete g.my_cards;
      delete g.players;
      delete g.cards_with_players;
      
      //take him to room
      window.location.hash = 'room'
      show('#room',1);

    }

    else{
      let player = g.get_player(id)
      notif(`${player.name} left the game`);

      //remove the player from list
      g.players = g.players.filter(e=>e.id != id);

      //re render the ui
      g.render_players();

      //remove from score cards
      if(t.host){
        delete g.scorecard[id]
      }
    }
  }


  logout(){
    g.exit_room();
    window.location = 'logout';
  }





  render_players(){
    /*
    render the playes on bottom bar
    */

    //arrange players accoring to the player on this screen
    let player_divided = [];

    let index = g.players.findIndex(e=>e.id==t.details.id);

    player_divided.push(g.players[index]);
    player_divided = player_divided.concat(g.players.slice(index+1))
    player_divided = player_divided.concat(g.players.slice(0,index))

    g.players = player_divided;

    player_divided.map((e,i) => {
      if(i==0){
        $('#players .me').html(`<div class="ic50 greyd bs3f br30 pr player bsc" count='0' player-id='${e.id}' style="background-image:url(img/dp/${e.id}.jpg)"></div>`);
      }
      else{
        $('#players .opponennt_players').append(`<div class="ic50 greyd bs3opp br30 mr20 pr player bsc" count='0' player-id='${e.id}' style="background-image:url(img/dp/${e.id}.jpg)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="ic50 pa t0 l0 rot-40"><circle fill="none" stroke="#1CEAA5" stroke-width="6" cx="50" cy="50" r="47"/></svg></div>`);
      }
    });

    $('#players .opponennt_players').css({"width":(g.players*60)+'px'})
  }




  


  cards_received(m){
    log(m);

    if(m.initial){
      sfx.start();
      g.my_cards = m.cards_received;
    }
    else{
      g.my_cards = g.my_cards.concat(m.cards_received);
      m.initial=0;
    }
    
    //render the card window
    g.render_my_cards(m.initial)
  }




  /*render my cards window, when cards will be changed*/
  render_my_cards(intitial=0){

    //first sort the cards
    g.my_cards.sort();

    $("#cards_chooseable .wrap").html(g.my_cards.map(make).join(''));
    $("#cards_chooseable .wrap").css({"width":(g.my_cards.length * 40)+'px'});


    /*--------add counter badge to all--------*/
    if(intitial){
      let all_users = {}
      g.players.map((e)=>{
        all_users[e.id] = g.my_cards.length;
      });
      g.render_card_count(all_users);
    }
    else{
      g.render_card_count({[t.details.id]:g.my_cards.length});
    }
    /*--------add counter badge to all--------*/
   



    function make(e,i){
      return `<label class="card" card-no="${e}-${i}">
        <input type="checkbox" name="selected_cards" value="${e}-${i}" class="pa o0">
        <div class="img_holder pr" card-no='${e}'><img src="img/blank_card.webp" class="w100 br8"></div>
      </label>`
    }
  }













  
  render_card_count(m){
    //loop all user and add card count (k:v)
    Object.keys(m).map(e=>{
      g.cards_with_players[e] = m[e];
      $(`.player[player-id='${e}']`).attr('count',m[e]);
    });
  }






  auto_Select_call(v){
    v = v.split('-')[0]

    //if turn call exisst the dont change the call, call selector are disabled
    if(g.turn_call)return;


    //get the value
    $(`#card_no_chooser input[name='call'][value='${v}']`).prop('checked',true)
  }




  empty_table(){
    //empty table, remove old cards, card count, last player cards, user, call, bluff button
    $(`#oldcards`).html('')
    $('#cards_on_table_count').text(0)
    $(`#latest_card`).html('')
    $(`#user_played`).html('')
    $(`#users_call`).html('')
    $(`#bluff`).hide()
  }


  

  
  render_current_turn(player_id,fresh_turn=0){
    log('----------start render-current-turn----------');
    log(`player_id : ${player_id}`);
    log(`fresh_turn : ${fresh_turn}`);

    

    g.turn_of_id = player_id;


    //make all players inactive
    $(`#players .player`).attr('active','0')


    if(fresh_turn){

      g.turn_call=0;
      
      g.old_cards_on_table = [];
      g.latest_cards_on_table = [];
      g.total_cards_on_table = 0;
      g.empty_table();

      //when fresh turn starts, empty all passed members
      g.passed_players = [];

    }
    
    //stop all timer
    g.stop_pass_timer()


    //if this is target player then opne card window
    if(player_id == t.details.id){
      //alert('my turn')

      //check if this user already passed in this turn, then pass
      //or this user have no cards
      if(
        g.passed_players.includes(t.details.id) ||
        g.winners.includes(t.details.id) ||
        g.my_cards.length==0
      ){
        log("i m passing - 433");
        //0 = dont display chat text, because its auto pass
        g.i_pass(0)
        return;
      }
      else{
        //open card window
        



        /*------disable, enable call selector-----*/
        $("#card_no_chooser input[name='call']").prop('disabled',(!g.turn_call ? false:true))
        if(!g.turn_call){
          g.card_window(1,0)
          $(`#card_no_chooser input[name='call']:checked`).prop('checked',false)
        }
        else{
          g.card_window(1,1)
          $(`#card_no_chooser input[name='call'][value='${g.turn_call}']`).prop('checked',true)
        }
        /*------disable, enable call selector-----*/


        //close exising timer
        g.timer_waiting_to_pass = setTimeout(g.i_pass,(g.turn_time * 1000));
      }
      
    }
    else{
      //show animation if player if my opponent
      $(`#players .player[player-id='${player_id}']`).attr('active','1')
    }



    log('----------end render-current-turn----------');
  }






  stop_pass_timer(){
    log('stop_pass_timer');

    if(g.timer_waiting_to_pass){
      clearTimeout(g.timer_waiting_to_pass)
      delete g.timer_waiting_to_pass;
    }
  }




  i_pass(text=1){
    log(`i_pass ---- ${text}`);

    g.card_window(0)

    //if user didnt repospond withing 10 sec, or manually passed, stop timer
    g.stop_pass_timer();

    mqtt.send(mqtt.game_topic, {game : {
      passed : t.details.id,
      text : (text ? `${t.details.name} passed` : 0)
    }});
  }



  /*---------when user will pass his turn, this function will be called------*/
  passed(m){
    log('------------ start of passed -------------')
    log(m);

    //call going on for this turn
    g.last_played_id = m.pid;

    //replace with chat
    if(m.text)notif(m.text)

    //stop animation
    $(`#players .player`).attr('active','0')

    //if passed client is not registered, the register him as passed
    if(!g.passed_players.includes(m.passed)){
      g.passed_players.push(m.passed)
    }



    log("----PASSED");
    log(g.passed_players);


    if(t.host){
      log('---- passed -- I AM HOST');
      g.clear_next_timer();
      //automatically call for next turn after 2 sec
      g.next_call_timer = setTimeout(g.start_next_turn, (2 * 1000));
    }
    log('------------ end of passed -------------')
  }












  put_card(){
    //when put button will be clicked this function will be called

    //stop the pass time timeout, else i_pass() will be called
    g.stop_pass_timer();


    //get select cards
    let form = $("#card_window").serializeArray();
    let payload = {
      pid   : t.details.id,
      cards : [],
    }

    let my_call_is=0;
  
    
/*
    g.turn_of_id            = id of player who played last
    g.turn_started_by_index = index of player who played last
    g.last_played_index  = id player who played last card
    g.turn_count            = no. of turn goin on
    g.passed_players        = [] , id of player who passed
*/


    //no turn call exists, make this user as turn starter
    if(!g.turn_call){
      payload.turn_started = 1;
    }
    else{
      my_call_is=1;
    }
  

    let selected_cards=[];

    form.map((e) => {
      if(e.name=='selected_cards'){
        selected_cards.push(e.value)
        payload.cards.push(e.value.split('-')[0])
      }
      if(e.name=='call' && !g.turn_call){
        //no call exists so allow to pass new call
          payload.turn_call = e.value;
          my_call_is=1;
      }
    });

    

     if(!my_call_is){
      notif("What's your call?");
      $('#card_no_chooser').addClass('blink');
      setTimeout(()=>{$('#card_no_chooser').removeClass('blink')},600)
      
      return;
    }
    else if(payload.cards.length==0){
      notif("Choose atleast 1 card or PASS");
      return;
    }

    

    /*----remove cards-------*/
    //remove select cards from my cards
    //remove one by one cards from main array
    let index;

    log('605 g.my_cards');
    log(g.my_cards);
    payload.cards.map(e=>{
      log('---LOOP--');

      //remove the first cards
      index = g.my_cards.findIndex(x => x==e);

      log(index);

      g.my_cards.splice(index,1);

      log(g.my_cards);

    });

    log('614 g.my_cards');
    log(g.my_cards);
    log('selected_cards');
    log(selected_cards);



    //this will remove all same no. cards
    //g.my_cards =  g.my_cards.filter(x => !payload.cards.includes(x));


    //remove from ui
    selected_cards.map(e=>{
      $(`#card_window .card[card-no='${e}']`).remove();
    })
    g.render_card_count({[t.details.id] : g.my_cards.length});
    /*----remove cards-------*/


    //close card window
    g.card_window(0)


    //pass cards i have to  all members
    payload.cards_have = g.my_cards.length

    
    log(g.turn_call);
    log(my_call_is);

    //send message to all, saying my playing details
    mqtt.send(mqtt.game_topic,{game : {cards_played : payload}})

  }















  cards_played(m){
    console.groupCollapsed('---------------start cards_played-------------');
    log(m);

  /*

    pid   : t.details.id,
    cards : [],
    call  : g.turn_call
    turn_started_by_id 
    turn_call
    cards_have
    



    g.turn_of_id            = id of player who played last
    g.turn_started_by_index = index of player who played last
    g.last_played_index     = index player who played last card
    g.turn_count            = no. of turn goin on
    g.passed_players        = [] , id of player who passed
    g.turn_call             = 0 , call of this turn

    g.old_cards_on_table = [];
    g.latest_cards_on_table = [];

*/




    //merge both old and new cards on table
    g.old_cards_on_table    = g.old_cards_on_table.concat(g.latest_cards_on_table);
    g.render_old_cards();

    g.latest_cards_on_table = m.cards;
    g.render_lastet_card();

    g.total_cards_on_table  = g.old_cards_on_table.length + g.latest_cards_on_table.length;
    $("#cards_on_table_count").html(g.total_cards_on_table);




    g.last_played_id    = m.pid;
    g.last_played_index = g.get_player_index(m.pid);

    g.cards_have        = m.cards_have;
    let player          = g.players[g.last_played_index];



    if(m.turn_started){
      g.turn_call = m.turn_call;
      g.turn_started_by_index = g.last_played_index;
    }




    

    /*--------allow to bluff for (10 - 2) sec---------*/
    //if any timer is going on, stop past timer, adjust table, start new timer
    

    g.stop_bluff_timer();
    g.bluff_timer = setTimeout(function(){
      g.times_up_for_bluff();
    },((g.turn_time - 2 )* 1000));
    /*--------allow to bluff for 8 sec---------*/

      
    //show turn call
    $('#users_call').html(`<span class='o6 ic ic40 f09 br50 count mr10' style="border: 1px solid #7881bf;">${m.cards.length}X</span><span>${g.turn_call}</span>`);



    //----update card count-----already deducted for self - --
    if(m.pid != t.details.id && m.hasOwnProperty('cards_have'))
      g.render_card_count({[m.pid] : m.cards_have});

    //add cards to table count
    $('#cards_on_table_count').text(g.old_cards_on_table.length + g.latest_cards_on_table.length);

    //render the lastest card on table
    g.render_lastet_card();

    //show user profile
    $('#user_played').html(`<div class="dp ic50 b3sf br30 greyd bsc" style="background-image:url(img/dp/${player.id}.jpg)"></div><!--div class="name pa white cgrey7 br20 p5 lc1 f08 bold">${player.name}</div-->`);

    //stop circle animation
    $(`#players .player[player-id='${m.pid}']`).attr('active','0')

    //hide bluff button for same user
    if(m.pid == t.details.id) $("#bluff").hide();
    else $("#bluff").show();



    //if host 
    if(t.host){
      log('---- cards_played -- I AM HOST');

      g.clear_next_timer();
      //automatically call for next turn after 10 sec
      g.next_call_timer = setTimeout(g.start_next_turn, (g.next_call_delay * 1000));
    }

    console.groupEnd('---------------end cards_played-------------');
  }




  clear_next_timer(){
    if(g.next_call_timer){
      clearTimeout(g.next_call_timer);
      delete g.next_call_timer;
    }
  }















  /*------------------------------winner--------------------------------*/


  new_winner(pid,score=0){
    log("-------new_winner");


    if(g.winners.includes(pid))return;

    g.winners.push(pid);

    score = g.players.length - Object.keys(g.winners).length;
    let rank = g.winners.length;


    log(`NEW winner iD:${pid}, score : ${score}`);

    if(!g.scorecard){
      g.scorecard={}
    }

    if(g.scorecard[pid]){
      g.scorecard[pid][0] = score;
      g.scorecard[pid][1].push(rank)

      if(g.scorecard[pid][1].length > 5){
        g.scorecard[pid][1].splice(0,(g.scorecard[pid][1].length - 5))
      }
    }
    else{
      g.scorecard[pid] = [score,[rank]]
    }


    mqtt.send(mqtt.game_topic,{
      game : {
        new_winner : {
          [pid]:g.scorecard[pid]
        }
      }
    })

    


    log("scorecard");
    log(g.scorecard);
  }




  arrPop(r){
    return r[(r.length  -1)]
  }
  
  
  winner_declared(m,rank=0){
    console.groupCollapsed('-------winner_declared--------');

    if(!g.scorecard){
      g.scorecard={}
    }

    log('old scorecard');
    log(g.scorecard);

    Object.keys(m).map(e=>{
      g.scorecard[e] = m[e];

      if(e == t.details.id){

        sfx.win();
        rank = g.arrPop(m[e][1]);

        log('I am winner');
        log(m[e]);
        log(rank);

        if(rank <= 3){
          $('#winner').attr('show','1').html(`<div class="pa t50 l0 w100 tty-50 tc"><img src="img/${rank}.webp" class="h100p rank pr z1"><br><img src="img/winner.webp" class="text w200p z2 pr"></div>`)
        
          setTimeout(()=>{party.sparkles(t.sparkles_event)},500);
          setTimeout(()=>{party.sparkles(t.sparkles_event)},900);
  
          setTimeout(()=>{$('#winner').attr('show','0')},4000)
        }
      }

    });


    log('updated scorecard');
    log(g.scorecard);

    console.groupEnd();
  }




  scorecard_received(m){
    log('-----------scorecard_received');
    log(m);
    g.scorecard = m;

    log('g.scorecard');
    log(g.scorecard);

    //show the button
    $('#open_scorecard').show();
  }



  
  render_scorecard(){
    if(!g.scorecard)return;

    $("#scorecard .list").html(`<div class='mask back mt'></div>
    <div class='mask click_back sw'></div>
    <div class="darkbg p15 wrap mw400 mcen">
      <div class="flex jcfe p10 o6 f07 tc">
        <div class="w130p">LAST 5</div>
        <div class="w50p">SCORE</div>
      </div>
      <hr>
      <div class='list mt5 ofya'>${Object.keys(g.scorecard).map(make).join('')}</div>

      <div class="last_5 mt20 o6 f08 flex">
        <div class='flex aic mr20'>
          <span class="score_dot mr10" score="1"></span>
          <span>1st</span>
        </div>
        <div class='flex aic mr20'>
          <span class="score_dot mr10" score="2"></span>
          <span>2nd</span>
        </div>
        <div class='flex aic mr20'>
          <span class="score_dot mr10" score="3"></span>
          <span>3rd and so on..</span>
        </div>
      </div>
    </div>`);


    function make(id){
      let each  = g.scorecard[id];
      let player = g.get_player(id);
      let last5 = each[1].map(e=>`<span class='score_dot' score='${e}'></span>`).join('')

      return `<div class="p5 flex jcsb aic">
        <div class="flex aic w50">
          <div class="ic35 greyd br50 bsc" style="background-image:url(img/dp/${player.id}.jpg)"></div>
          <div class="lc1 cgrey5 ml10 w-50">${player.name}</div>
        </div>
        <div class="w50 flex">
          <div class="last_5 flex w-50">${last5}</div>
          <div class="tc w50p">${each[0]}</div>
        </div>
      </div>`
    }
    
  }




  /*------------------------------winner--------------------------------*/






  /*
  render the latest cards on table
  */
  render_lastet_card(){
    $('#latest_card').html(g.latest_cards_on_table.map(make_cards).join(''));
    function make_cards(e){
      return `<div class="card">
        <div class="img_holder pr"><img src="img/card.webp" class="w100 br6"></div>
        <!--div class="img_holder pr" card-no="${e}"><img src="img/card.webp" class="w100 br6"></div-->
      </div>`
    }
  }


  stop_bluff_timer(){
    if(g.bluff_timer){
      clearTimeout(g.bluff_timer)
      delete g.bluff_timer;
    }
  }








  times_up_for_bluff(){
    log('--- GAME times_up_for-bluff');

    g.stop_bluff_timer();

    //this will be called after (10 - 2) sec from the time of card playing

    //hide bluff button
    $("#bluff").hide();


    g.old_cards_on_table    = g.old_cards_on_table.concat(g.latest_cards_on_table);
    g.render_old_cards();

    g.latest_cards_on_table=[];
    
  
    //remove lastest cards
    $('#latest_card').html('');
  }





  render_old_cards(){
    //clean table, add last cards to old cards
    let c='';
    let max = (g.total_cards_on_table > 12 ? 12 : g.total_cards_on_table)
    for(let ic=0;ic<max;ic++){
      c += '<div class="card"><div class="img_holder pr"><img src="img/card.webp" class="w100 br4"></div></div>';
    }
    $("#oldcards").html(c);
  }



  
/*----------bluff--------*/

  bluff(){
    console.groupCollapsed('----------- i am bluffing ----------922--');

    //this will be called when bluff button is pressed
    //check whether false bluff or correct
    let bluffed=0;
    

    log(g.latest_cards_on_table);

    

    g.latest_cards_on_table.map(e=>{

      log(`loop e:${e}, turn_call:${g.turn_call}`);

      if(e != g.turn_call){
        bluffed=1;
      }
    });

    //pass all cards
    g.old_cards_on_table = g.old_cards_on_table.concat(g.latest_cards_on_table);
    
    let payload = {
      bluffed_by : t.details.id,
      bluffed_to : g.last_played_id,
      cards : g.old_cards_on_table,
    }

    log(`bluffed : ${bluffed}`);

    if(bluffed){
      payload.won = t.details.id;
      payload.loser = g.last_played_id;
    }
    else{
      payload.won = g.last_played_id;
      payload.loser = t.details.id;
    }

    g.card_window(0)
    g.stop_bluff_timer();

    //send message to all
    mqtt.send(mqtt.game_topic,{
      game:payload
    })

    log(payload);
    console.groupEnd();

  }



  

  bluffed(m){
    console.groupCollapsed('-----------bluffed--------- 978 ---');
    log(m);

    //this will be called when some one bluffs someone

    let by = g.players.find(e=>e.id==m.bluffed_by)
    let to = g.players.find(e=>e.id==m.bluffed_to)



    sfx.bluffed();

    if(by && to){
      notif(`${by.name} bluffed ${(m.won==by.id?'':' - wrong guess')}`);
    }


    g.clear_next_timer();
    g.stop_bluff_timer();
    g.stop_pass_timer();
    g.card_window(0);
    

    //this is the victim (not won)
    if(m.loser==t.details.id){
      log(`I LOST : ${m.loser} CARDS:${m.cards.length}`);

      window.navigator.vibrate([300, 100, 200]);
      sfx.lose()

      g.cards_received({cards_received:m.cards})
    }
    else{
      g.cards_with_players[m.loser] += m.cards.length

      log(`cards counter for looser, user=${m.loser} : `+g.cards_with_players[m.loser]);

      //render the cards who loosed
      g.render_card_count({[m.loser] : g.cards_with_players[m.loser]})
    }




    
    
    //empty the table, and adjust table
    g.old_cards_on_table = [];
    g.latest_cards_on_table = [];
    g.total_cards_on_table = 0;
    g.empty_table();



    //stop animtion
    $(`#players .player`).attr('active','0');
    


   





    
    
    if(t.host){
      log('---- bluffed -- I AM HOST');

      g.clear_next_timer();
      g.next_call_timer = setTimeout(g.start_fresh_turn, (3 * 1000));

      //who ever won will start the next turn
      //so set the last index to winner - 1
      
      g.turn_started_by_index =  (g.get_player_index(m.won)) - 1;

      log(`last turn played by : INDEX:${g.turn_started_by_index}`)

    }

    console.groupEnd();

  }

/*----------bluff--------*/




















  card_window(open=1,mini=0){

    

    $('#card_window').attr('show',open).attr('mini',mini);


    if(open){
      
      window.navigator.vibrate([200,100]);

      $('#scorecard').attr("show",'0');
    }

    if(!mini && window.innerWidth < 900){

      return;
      if(open){
        $("#table").css({'top':'-45px'})
      }
      else{
        $("#table").css({'top':'75px'})
      }
    }
  }




  render_new_round(round){
    g.round = round;
    g.winners = []

    $('.round_no').text(round);
    $('#start_round_wrap').show();
    $('#cards_chooseable .wrap').html('');

    //empty_table
    g.old_cards_on_table = [];
    g.latest_cards_on_table = [];
    g.total_cards_on_table = 0;
    g.empty_table();



    g.stop_pass_timer();
    g.card_window(0);
  }



  messageArrived(m){
    log(m);


    if(m.i_subscribed){
      log(m);

      //some user subscribed game topic
      if(!g.players_subscribed.includes(m.i_subscribed)){
        g.players_subscribed.push(m.i_subscribed)
      }
    }
    else if(m.new_round){
      

      //m.new_round = round no.
      g.render_new_round(m.new_round);
    }
    else if(m.start_round){
      g.start_round()
    }


    else if(m.fresh_turn){
      log(m);

      //m.fresh_turn = id of player who will start the turn
      g.render_current_turn(m.fresh_turn,1)
    }

    else if(m.next_turn){
      log(m);

      //next_turn : g.turn_of_id,
      g.render_current_turn(m.next_turn,0)
    }

    //card received (from distrubution/ table)
    else if(m.cards_received && m.player_id==t.details.id){
      g.cards_received(m);
    }
    
    else if(m.card_counts){
      //recevie user id, card count (k,v)
      g.render_card_count(m.card_counts);
    }

    
    else if(m.passed){
      g.passed(m);
    }
    else if(m.bluffed_by){
      g.bluffed(m);
    }
    else if(m.cards_played){
      g.cards_played(m.cards_played);
    }

    else if(m.round_over || m.scorecard){

      if(m.scorecard){
        g.scorecard_received(m.scorecard);
      }

      if(m.round_over){
        g.round_over(m.round_over);
      }

    }

    else if(m.new_winner){
      g.winner_declared(m.new_winner);
    }


    else if(m.exit_room){
      g.exit_room(m.exit_room);
    }

    
    
    


    else{
      log('--- Game mqtt');
      log(m);
    }

  }








    
  /*----------------for host-------------------*/
  
  init_round(){
    log('--------------------init_round------------------------');

    


    if(g.all_players_connected){
      //invite with a delay of 4 sec
      setTimeout(g.invite_for_new_round(),4000)
    }
    else{
      //check every 300ms if all user conected or not
      g.timer_subscriber = setInterval(() => {
        if(g.all_players_connected || (g.players_subscribed && g.players_subscribed.length >= g.players.length)){

          clearInterval(g.timer_subscriber)
          delete g.timer_subscriber;
          delete g.players_subscribed;

          g.all_players_connected=1;

          g.invite_for_new_round()
          

        }
      }, 300);
    }

    


    g.winners             = []
    
    g.round               = (!g.round ? 1 : (g.round+1));
    g.players_ready       = 0;
    g.cards_with_players = {}


  }




  round_over(round = 0){

    if(!round && t.host){

      //round over so geenrate score cards for all
      g.players.map(e=>{
        //those whose dont have name in winner array add score for them
        if(!g.winners.includes(e.id)){
          g.new_winner(e.id)
        }
      });


      mqtt.send(mqtt.game_topic,{
        game : {
          round_over : g.round,
          scorecard : g.scorecard
        }
      })
  
      setTimeout(g.init_round,2000);
      return;
    }

    notif(`Round ${round} over`);

    g.old_cards_on_table = [];
    g.latest_cards_on_table = [];
    g.total_cards_on_table = 0;
    g.empty_table();
    

    $('#card_window .wrap').html('');
    $('#players .player').attr('count','0');

  }






  invite_for_new_round(){
    //boardcast invitation for enw round
    mqtt.send(mqtt.game_topic,{
      game:{
        new_round : g.round
      }
    });


    g.distribute_card();
  }





  start_round(){
    

    if(t.host){
      g.players_ready++;

      if(g.players_ready >= g.players.length){
        console.log("everybody is ready, make first turn");
        setTimeout(g.start_fresh_turn,2000)
      }
    }
  }





  get_next_player_index(p){
    log('-----get_next_player_index');
    log('past : '+p);

    p++;
    p = (p >= g.players.length)?0:p;

    log('past : '+p);

    return p;
  }


  get_player_id(index){
    log(index);

    return g.players[index].id;
  }

  get_player_index(id){
    return g.players.findIndex(e=>e.id==id)
  }

  get_player(id){
    return g.players.find(e=>e.id==id)
  }



  start_fresh_turn(){
    console.groupCollapsed('--------start of start-fresh-turn-------');
    

/*
    g.turn_of_id            = id of player who played last
    g.turn_started_by_index = index of player who played last
    g.last_played_index     = id player who played last card
    g.turn_count            = no. of turn goin on
    g.passed_players        = [] , id of player who passed
    g.turn_call             = 0 , call of this turn
*/



    log(`trun started by played by : INDEX:${g.turn_started_by_index}`)



     //check how many player have cards with them
     let players_with_cards = Object.keys(g.cards_with_players).filter(e => g.cards_with_players[e] > 0)

     log(players_with_cards);

     //only 1 player is having cards
     if(players_with_cards.length == 1){

       console.groupEnd('all completed, now start new round');
       g.round_over();
       return;
     }


     



    g.passed_players = [];

    //no one playeed yet
    g.last_played_id=-1;

    //set turn count
    g.turn_count = g.turn_count ? (g.turn_count+1) : 1;


    let allowed_to_start_turn=0;
    let loop=0;

    while(!allowed_to_start_turn){
      log(`-----while SFT`);

      //looped for all user, no one is allowed to play cards, so start fresh round
      if(loop >= g.players.length){
        console.groupEnd(`1206 - loop ${loop}, players:${g.players.length},  `);

        g.round_over();
        allowed_to_start_turn=1;
        return;
      }


      


      //who will start the turn
      if(!g.hasOwnProperty('turn_started_by_index')){
        log('128 if TURN STARTED: '+g.turn_started_by_index);
        g.turn_started_by_index = getRandom(0,(g.players.length-1));
      }
      else{
        log('128 else TURN STARTED: '+g.turn_started_by_index);
        g.turn_started_by_index = g.get_next_player_index(g.turn_started_by_index)
      }

      log('1286 TURN STARTED:'+g.turn_started_by_index);



      //fresh turn so turn will be started by g.turn_started_by
      g.turn_of_id = g.get_player_id(g.turn_started_by_index)

      log(g.cards_with_players[g.turn_of_id]);



      //if the player have cards to play, the allo w him to start turn
      if(g.cards_with_players[g.turn_of_id] > 0){
        allowed_to_start_turn = 1;
      }

      log(`LOOP ${loop}, TURN-WILL-START-BY:${g.turn_started_by_index}, TURN-id:${g.turn_of_id}, ALLOWED:${allowed_to_start_turn}`);

      loop++;
    }
    
    //else if first player passes error will bw thrown
    g.last_played_index = g.turn_started_by_index;


    log(`turn will be started by : ${g.turn_of_id}`);
    
    mqtt.send(mqtt.game_topic,{
      game:{
        fresh_turn : g.turn_of_id
      }
    });

    console.groupEnd('--------end of start-fresh-turn-------');
  }







  
  start_next_turn(){
    console.groupCollapsed('--------start of start-next-turn-------');

    /*
        g.turn_of_id            = id of player who played last
        g.turn_started_by_index = index of player who played last
        g.last_played_index     = id player who played last card
        g.turn_count            = no. of turn goin on
        g.passed_players        = [] , id of player who passed
    */

    //clear all next timer
    g.clear_next_timer()



    //if last played member have no more cards, add him to winers list
    if(g.cards_have==0){
      g.new_winner(g.turn_of_id)
    }

    //no longer requried
    delete g.cards_have;


    //if all user passed, then start new turn
    if((g.winners.length + g.passed_players.length) >= g.players){
      console.groupEnd('all completed, now start new turn');
      g.start_fresh_turn();
      return;
    }




    let allowed_to_start_turn=0;
    let loop=0;

    while(!allowed_to_start_turn){
      log("------WHILE");
      //looped for all user, no one is allowed to play cards, so start fresh turn
      if(loop >= g.players.length){
        console.groupEnd();
        g.start_fresh_turn();
        allowed_to_start_turn=1;
        return;
      }


      log(g.last_played_index);
      
      //who will start the turn
      g.last_played_index = g.get_next_player_index(g.last_played_index)

      log(g.last_played_index);

      g.turn_of_id = g.get_player_id(g.last_played_index)

  
      log(g.passed_players);
      log(g.cards_with_players[g.turn_of_id]);
      log(g.turn_of_id);


      //if the player have cards to play, 
      //&& he haven't pass yet, the allow him to start turn
      if(g.cards_with_players[g.turn_of_id] > 0 && !g.passed_players.includes(g.turn_of_id)){
        allowed_to_start_turn = 1;
      }
  

      log(`LOOP ${loop}, LAST-PLAYED-BY:${g.last_played_index}, TURN-id:${g.turn_of_id}, ALLOWED:${allowed_to_start_turn}`);


      loop++;
    }
    

    
    mqtt.send(mqtt.game_topic,{
      game:{
        next_turn : g.turn_of_id,
      }
    });

    console.groupEnd('--------end of start-next-turn-------');

  }












 


























  distribute_card(){
    console.groupCollapsed('--------distribute-card-------');

    if(!t.host)return;

    let single_set = [
      'A','A','A','A',
      'J','J','J','J',
      'Q','Q','Q','Q',
      'K','K','K','K',
      '2','2','2','2',
      '3','3','3','3',
      '4','4','4','4',
      '5','5','5','5',
      '6','6','6','6',
      '7','7','7','7',
      '8','8','8','8',
      '9','9','9','9',
      '10','10','10','10'
    ]

    let card_available = [];

    let member_count = g.players.length;
    let card_for_everyone = 13;
    let card_required = member_count * card_for_everyone;
    let set_requried = Math.ceil(card_required / 52);

    let card_for_user = [];

    //make a array of avaialble cards
    for(let i=0;i<set_requried;i++){
      card_available = card_available.concat(single_set)
    }

    //make empty array for all members
    for(let i=0;i<member_count;i++){
      card_for_user.push([])
    }


    //distribute 13 cards 
    for(let i=0;i<card_for_everyone;i++){
      //for all members
      for(let member=0;member<member_count;member++){
        let random = getRandom(0,card_available.length-1)
        card_for_user[member].push(card_available[random]);
        card_available.splice(random,1);
      }
    }

 
    g.players.map((e,i) => {
      log('sending cards to user '+e.id);
      log(card_for_user[i]);

        //unicast to user's id topic
        mqtt.send('USER/'+e.id,{
          game:{
            player_id : e.id,
            cards_received : card_for_user[i],
            initial : 1,
          }
        })


        g.cards_with_players[e.id] = card_for_everyone;
    });

    console.groupEnd();
  }

  /*----------------for host-------------------*/
  

}



