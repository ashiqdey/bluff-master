
class Game{
  constructor(){


    this.players_subscribed=[];
    this.winners={};
    

    this.turn_time=15;//15 sec

    this.next_call_delay = 2;//allow 2 sec delay to start the next turn
    this.total_cards_on_table=0

    //round will start when clicked this button
    $(document).on('click','#start_round',function(){
			$(this).hide();
			mqtt.send(mqtt.host_topic,{game:{start_round:1}})
		})



    $(document).on('submit','#card_window',function(e){
      e.preventDefault();
    })

    $(document).on('click','#game_pass',function(e){
      e.preventDefault();
      g.i_pass();
    })

    $(document).on('click','#game_put',function(e){
      e.preventDefault();
      g.put_card();
    })



    $(document).on('click','#bluff',function(){
			$(this).hide();
			g.bluff();
		})


    $(document).on('change',"#card_window input[name='selected_cards']",function(){
			g.auto_Select_call($(this).val());
		})

    

  }
  
  

  render_game(){

    g.my_cards=[];
    g.player_card_count={};


    $('#app').html(`
      <div id='main_game' class="pf t0 l0 w100 h100">

        <div class="ribbon flex aic jcsb p10 pr">
          
          <div class="flex aic ca" sel='#card_window' t='show' v='1'>
            <img src="icon/king.svg" class="ic25">
            <span class="f12 bold ml10">Round - <span class='round_no'></span></span>
          </div>
          <div class="flex aic">
            <div class="ic40 ic p5"><img src="icon/mic.svg" class=""></div>
            <div class="ic40 ic p5 ml10"><img src="icon/chat.svg" class=""></div>
            <div class="ic40 ic p5 ml10"><img src="icon/3dot.svg" class=""></div>
          </div>


          <div id='chat_received' class='pf z5 black cgrey7 f08 br10'>sfd</div>
        </div>



        <div id="table" class="pf w100 p10">
          <div class="border p10 pa ofh">
            <div class="border_bg pa optional_animation" animate='0'></div>
            <div class="carpet pa p10">

              <div class='pa h100 w100'>
                <duv class='pa w100 tc t50 l50 tt-50 z5'><button id='start_round' class='but fat theme'>TAP TO START</button></div>


                <div id="oldcards" class="flex"></div>
                <div id="cards_on_table_count" class="pa ic30 cgrey7 br30 ic f08 bolder">0</div>


                <div id="latest_card" class="pa l50 tt-50 flex jcc"></div>


                <div id="user_played" class="pa b0 tc"></div>
                <div id="users_call" class="pa b0 w100 tc l0 p15 bold f12"></div>
                <div id="bluff_cta" class="pa b0 r0 p10">
                  <button class="but mbut red p8_30 dn" id='bluff'>BLUFF</button>
                </div>
              </div>


            </div>
          </div>
        </div>



        <form id="card_window" class="pf l0 w100 b0" show='0'>
          <div class="progress"><div class='dn'></div></div>

          <div class="ofxa w100 tscroll" id="cards_chooseable">
            <div class="flex p20 wrap"></div>
          </div>



          <div class="form_self_turn dn">
            <div id='card_no_chooser' class="flex fww p10 jcc mt10 cgrey9"></div>

            <div class="flex aic m2 jcsb p20 mw400 mcen">
              <button class="but mr10 red" id="game_pass">PASS</button>
              <button class="but ml10 theme" id="game_put">PUT</button>
            </div>
          </div>
        </form>




        <div id="players" class="pf z3 w100 b0 l0 flex">
          <div class="me p15 w80p"></div>
          <div class="opponennts w-80 darkbg">
            <div class="ofxa w100 tscroll">
              <div class='flex p15 opponennt_players'></div>
            </div>
          </div>
        </div>

      </div>`);


      g.render_players()
      
      if(t.host){

        //check every 300ms if all user conected or not
        g.timer_subscriber = setInterval(() => {
          if(g.players_subscribed.length >= g.players.length){

            clearInterval(g.timer_subscriber)
            delete g.timer_subscriber;
            delete g.players_subscribed;

            g.all_players_connected=1;

            g.distribute_card();
          }
        }, 300);


        g.init_round();
      }

      
      


      /*--------render the card choosing buttons----------*/
      const card_symbols = ['A','K','Q','J','2','3','4','5','6','7','8','9','10']
      $("#card_no_chooser").html(card_symbols.map(make_no_sel).join(''));

      function make_no_sel(e){
        return `<label class="p5 pr cp">
          <input type="radio" name="call" value="${e}" class="pa o0">
          <div class="text ic35 ic">${e}</div>
        </label>`
      }
      /*--------render the card choosing buttons----------*/



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
      g.my_cards = m.cards_received;

      $('#start_round').show();

      $('.round_no').text(m.round)
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
   



    function make(e){
      return `<label class="card" card-no="${e}">
        <input type="checkbox" name="selected_cards" value="${e}" class="pa o0">
        <div class="img_holder pr" card-no='${e}'><img src="img/blank_card.webp" class="w100 br8"></div>
      </label>`
    }
  }


  render_card_count(m){
    //loop all user and add card count (k:v)
    Object.keys(m).map(e=>{
      g.player_card_count[e] = m[e];
      $(`.player[player-id='${e}']`).attr('count',m[e]);
    });
  }






  auto_Select_call(v){
    //if turn call exisst the dont change the call, call selector are disabled
    if(g.turn_call)return;

    //get the value
    $(`#card_no_chooser input[name='call'][value='${v}']`).prop('checked',true)
  }







  




  /*
  admin will call this function 
  current playing player's info will be passed, alter UI accordingly
  */
  render_current_player(m){
    log('----------start render_current_player----------');
    log(m)

    g.turn_call = m.turn_call;
    g.current_player = m.whose_turn;


    //$(`#users_call`).text('')



    //make all players inactive
    $(`#players .player`).attr('active','0')
    
    if(m.fresh_turn){
      //when fresh turn starts, empty all passed members
      g.turn_passed=[]

      //empty the table
      g.total_cards_on_table = [];
      $('#cards_on_table_count').text(0)
    }
    





    //if this is target player then opne card window
    if(m.whose_turn == t.details.id){


      //check if this user already passed in this turn, then pass
      //or this user have no cards
      if(
        g.turn_passed.includes(t.details.id) ||
        g.my_cards.length==0
      ){
        log("i m passing - 542");
        //0 = dont display chat text
        g.i_pass(0)
        return;
      }
      else{
        g.card_window(1)


        /*------disable, enable call selector-----*/
        //if turn_call is valid then disable it lese, allow to choose his own call
        $("#card_no_chooser input[name='call']").prop('disabled',(g.turn_call ? true:false))
        
        //select the turn call  button
        if(g.turn_call){
          $(`#card_no_chooser input[name='call'][value='${g.turn_call}']`).prop('checked',true)
        }



        //allow 10 sec to put cards
        g.timeout = setTimeout(g.i_pass,(g.turn_time * 1000));
      }

      


      
    }
    else{
      //show animation if player if my opponent
      $(`#players .player[player-id='${m.whose_turn}']`).attr('active','1')
    }


    log('----------end render_current_player----------');


  }










  i_pass(text=1){
    g.card_window(0)
    

    //if user didnt repospond withing 10 sec, or manually passed, stop timer
    if(g.timeout){
      clearTimeout(g.timeout)
      delete g.timeout;
    }

    mqtt.send(mqtt.game_topic, {game : {
      passed : t.details.id,
      turn_call : g.turn_call,
      text : (text ? `${t.details.name} passed` : 0)
    }});

  }



  /*---------when user will pass his turn, this function will be called------*/
  passed(m){
    log('------------ start of passed -------------')
    log(m);

    //call going on for this turn
    g.turn_call = m.turn_call;


    //replace with chat
    if(m.text)notif(m.text)


    //stop animation
    $(`#players .player`).attr('active','0')

    
    log(g.turn_passed)
    //if passed client is not registered, the register him as passed
    if(!g.turn_passed.includes(m.passed)){
      g.turn_passed.push(m.passed)
    }


    //if host
    if(t.host){
      log('-----passed I AM HOST');


      if(g.next_call_timer){
        clearTimeout(g.next_call_timer);
        delete g.next_call_timer;
      }

      //automatically call next turn after 10 sec
      g.next_call_timer = setTimeout(function(){
        console.log('---passed next_call_timer g.start_turn(0)');
        /*
        check if passed member count == players playing count
        every body passed so start new turn
        */
        if(g.turn_passed.length == g.players.length){
          g.start_turn();
        }
        else{
          //give turn to next player
          g.start_turn(0);
        }
      },g.next_call_delay * 1000);


      
    }

    log('------------ end of passed -------------')

  }












  put_card(){
   
    //when put button will be clicked this function will be called

    //stop the i_pas timeout, else i_pass will be called
    if(g.timeout){
      clearTimeout(g.timeout)
      delete g.timeout;
    }


    //get select cards
    let form = $("#card_window").serializeArray();
    let payload = {
      pid : t.details.id,
      cards : [],
      call:0
    }

    


    //no turn call exists, make this user as turn starter
    if(!g.turn_call){
      payload.turn_started_by = t.details.id;
    }
    else{
      payload.call = g.turn_call;
    }



    form.map((e) => {
      if(e.name=='selected_cards'){
        payload.cards.push(e.value)
      }
      if(e.name=='call' && !g.turn_call){
        //no call exists so allow to pass new call
          payload.call = e.value;
          payload.turn_call = e.value;
      }
    });

    if(payload.cards.length==0){
      notif("Choose atleast 1 card or PASS");
      return;
    }

    else if(!payload.call){
      notif("What's your call?");
      return;
    }

    

    /*----remove cards-------*/
    //remove select cards from my cards
    g.my_cards =  g.my_cards.filter(x => !payload.cards.includes(x));

    //remove from ui
    payload.cards.map(e=>{
      $(`#card_window .card[card-no='${e}']`).remove();
    })
    g.render_card_count({[t.details.id] : g.my_cards.length});
    /*----remove cards-------*/


   
    

    g.card_window(0)

    //pass cards i have to  all members
    payload.cards_have = g.my_cards.length

    //send message to all, saying my playing details
    mqtt.send(mqtt.game_topic,{game : {cards_played : payload}})

  }















  cards_played(m){
    log('---------------start cards_played-------------');
    log(m);

    //store cards played in variable
    g.cards_on_table = m.cards;
    g.call = m.call;
    g.cards = m.cards;
    g.last_played = m.pid;

    if(m.turn_call){
      g.turn_call = m.turn_call;
    }



    /*----update card count-------*/
    //already deducted for self 
    if(m.pid != t.details.id && m.hasOwnProperty('cards_have')){
      //deduct the cards from users count
      g.render_card_count({[m.pid] : m.cards_have});
    }
    /*----update card count-------*/

    

    


    /*--------allow to bluff for 8 sec---------*/
    //if any timer is going on, stop past timer, adjust table, start new timer
    if(g.bluff_timer){
      clearTimeout(g.bluff_timer)
      delete g.bluff_timer;

      g.adjust_table();
    }

    g.bluff_timer = setTimeout(function(){
      g.adjust_table();
    },((g.turn_time - 2 )* 1000));
    /*--------allow to bluff for 8 sec---------*/




    //add cards to table count
    g.total_cards_on_table = g.total_cards_on_table.concat(m.cards)
    $('#cards_on_table_count').text(g.total_cards_on_table.length);


    //render the card on table
    $('#latest_card').html(m.cards.map(make_cards).join(''));
    function make_cards(e){
      return `<div class="card">
        <div class="img_holder pr"><img src="img/card.webp" class="w100 br6"></div>
        <!--div class="img_holder pr" card-no="${e}"><img src="img/card.webp" class="w100 br6"></div-->
      </div>`
    }


    let player = g.players.find(e=>e.id==m.pid);

    //show user profile
    $('#user_played').html(`<div class="dp ic50 b3sf br30 greyd bsc" style="background-image:url(img/dp/${player.id}.jpg)"></div><div class="name pa white cgrey7 br20 p5 lc1 f08 bold">${player.name}</div>`);


    //show players call
    $('#users_call').html(`<span class='o6'>${m.cards.length}X</span> ${m.call}`);
    

    //stop circle animation
    $(`#players .player[player-id='${m.pid}']`).attr('active','0')




    


    //hide bluff button for same user
    if(m.pid == t.details.id){
      $("#bluff").hide();
    }
    else{
      $("#bluff").show();
    }


    //if host 
    if(t.host){
      log('---- cards_played -- I AM HOST');


      if(m.cards_have==0){
        g.completed_players.push(m.pid);
        log('---g.completed_players');
        log(g.completed_players);

        winner(m.pid)
        

        
      }



      //check if only 1 member is remaining
      if((g.completed_players.length + 1) >= g.players.length){
        log('all completed, now start new rounf');

        //only player remanning
        //get his id
        let id = g.players.filter(e=>!g.completed_players.includes(m.pid));
        winner(id);
      }


      //maintain last played member
      if(g.turn_started_by){
        g.turn_started_by = m.turn_started_by;
      }

      if(g.next_call_timer){
        clearTimeout(g.next_call_timer);
        delete g.next_call_timer;
      }

      //automatically call next turn after 10 sec
      g.next_call_timer = setTimeout(function(){
        console.log('---next_call_timer g.start_turn(0)');
        g.start_turn(0)
      },g.next_call_delay * 1000);

    }


    log('---------------end cards_played-------------');


    function winner(id){
      //score = total member - completed members
      let score = g.players.length - g.completed_players.length;

      log('score : '+score);

      if(g.winners[id]){
        g.winners[id].push(score)
      }
      else{
        g.winners[id] = [score]
      }
    }


  }








  
/*----------bluff--------*/

  bluff(){
    //this will be called when bluff button is pressed
    //check whether false bluff or correct
    let bluffed=0;

    g.cards.map(e=>{
      if(e != g.turn_call){
        bluffed=1;
      }
    });

 
    //if bluff failed
    if(!bluffed){
      g.my_cards = g.my_cards.concat(g.total_cards_on_table);
      g.render_my_cards();
    }


    log(`won by: bluffed:${bluffed} , `+(bluffed ? t.details.id : g.last_played));

    //send message to all
    mqtt.send(mqtt.game_topic,{
      game:{
        bluff:{
          bluffed_by : t.details.id,
          bluffed_to : g.last_played,
          cards : g.total_cards_on_table,
          won : (bluffed ? t.details.id : g.last_played)
        }
      }
    })

  }



  bluffed(m){
    log('-----------bluffed----------');
    log(m);

    //this will be called when some one bluffs someone

    let by = g.players.find(e=>e.id==m.bluffed_by)
    let to = g.players.find(e=>e.id==m.bluffed_to)

    if(by && to){
      notif(`${by.name} bluffed ${to.name} - ${(m.won==by.id?'perfect guess':'wrong guess')}`);
    }


    //empty the table, and adjust table
    g.total_cards_on_table =[]
    g.adjust_table();



    //stop current player timer
    if(g.timeout){
      //clear timer, close card window, remove active user
      clearTimeout(g.timeout);
      g.card_window(0);
      $(`#players .player`).attr('active','0');
    }
    
    
    

    //alter counter
    let looser = (m.won == m.bluffed_by) ? m.bluffed_to : m.bluffed_by;
    g.player_card_count[looser] += m.cards.length
    g.render_card_count({[looser] : g.player_card_count[looser]})

    log(`cards counter for user ${looser} : `+g.player_card_count[looser]);


    //this is the victim (not won)
    if(m.bluffed_to == t.details.id && m.won!=t.details.id){

      if(m.bluffed_to == t.details.id){
        //accept all cards
        g.my_cards = g.my_cards.concat(m.cards);
        g.render_my_cards();
      }

    }




    if(t.host){
      log('---- I AM HOST');

      if(g.next_call_timer){
        clearTimeout(g.next_call_timer);
        delete g.next_call_timer;
      }

      //automatically call next turn after 2 sec
      g.next_call_timer = setTimeout(function(){
        console.log('---next_call_timer bluffed g.start_turn(0)');

          log('m.won :'+m.won)
          log(m.bluffed_by)
          log(m.bluffed_to)

        //who ever won will start this turn
        if(m.won == m.bluffed_by){
          //will start by this winner 
          g.turn_will_start_by = m.bluffed_by;
        }
        else{
          g.turn_will_start_by = m.bluffed_to;
        }

        g.start_turn()
      },2 * 1000);

    }
  }

/*----------bluff--------*/









  adjust_table(){
    //this will be called after 8 sec from the time of card playing

    //hide bluff button
    $("#bluff").hide();

    //take lastet cards to  old
    g.add_last_cards_to_old();

    //remove lastest cards
    //$('#latest_card').html('');

    //hide user
    //$('#user_played').html('');
  }




  add_last_cards_to_old(){
    log('--- GAME add_last_cards_to-old');
    log(g.total_cards_on_table);

    /*
    g.cards_on_table = m.cards;
    g.total_cards_on_table += m.cards.length;

    calculate the position of card
    append card one by one
    */

    //clean table, add last cards to old cards
    let c='';
    let max = (g.total_cards_on_table.length > 12 ? 12 : g.total_cards_on_table.length)
    for(let ic=0;ic<max;ic++){
      c += '<div class="card"><div class="img_holder pr"><img src="img/card.webp" class="w100 br6"></div></div>';
    }
    $("#oldcards").html(c);
    $("#cards_on_table_count").html(g.total_cards_on_table.length);

  }





  card_window(open=1){
    $('#card_window').attr('show',open);

    //get the height
    if(open){
      $("#table").css({'top':'-45px'})
    }
    else{
      $("#table").css({'top':'55px'})
    }
  }








  messageArrived(m){
    
    if(m.i_subscribed){
      //some user subscribed game topic
      if(!g.players_subscribed.includes(m.i_subscribed)){
        g.players_subscribed.push(m.i_subscribed)
      }
    }

    //card received (from distrubution/ table)
    else if(m.cards_received && m.player_id==t.details.id){
      g.cards_received(m);
    }

    
    else if(m.card_counts){
      //recevie user id, card count (k,v)
      g.render_card_count(m.card_counts);
    }

    else if(m.start_round){
      if(t.host){
        g.players_ready++;

        if(g.players_ready >= g.players.length){
          console.log("everybody is ready, make first turn");
          g.start_turn();
        }
      }
    }



    else if(m.whose_turn){
      g.render_current_player(m);
    }

    else if(m.passed){
      g.passed(m);
    }
    else if(m.bluff){
      g.bluffed(m.bluff);
    }
    else if(m.cards_played){
      g.cards_played(m.cards_played);
    }

    else if(m.round_over){
      g.round_over(m.round_over);
    }
    else{
      log('--- Game mqtt');
      log(m);
    }


  }

  round_over(m){
    notif(`Round ${m.round} over`);

    //clear table
    //clear my cards
    $('#oldcards').html('');
    $('#latest_card').html('');
    $('#cards_on_table_count').html('0');
    $('#card_window .wrap').html('');

    $('#players .player').attr('count','0');
  }









    
  /*----------------for host-------------------*/
  
  init_round(){
    log('--------------------init_round------------------------');


    if(g.can_distribute){
      g.all_players_connected();
    }


    g.completed_players=[]
    g.round = (!g.round) ? 1 : (g.round+1);
    g.players_ready=0;

    if(!g.turn_started_by)g.whose_turn=0;

  }



  

  start_turn(fresh_turn=1){
    log('--------start of start-turn-------');
    log('g.whose_turn : '+g.whose_turn);
    log('fresh_turn : '+fresh_turn);
    

    //check if more than 2 user is remaining
    if((g.completed_players.length + 1) == g.players.length){
      mqtt.send(mqtt.game_topic,{game:{round_over:g.round}})
      setTimeout(g.init_round,2000)
      return
    }


    //fresh turn
    if(fresh_turn){
      //hold passed members id
      g.turn_passed = []

      //set turn call as 0, so that user can select his call
      g.turn_call = 0;

      //select the next player to start this turn
      if(g.hasOwnProperty('turn_started_by')){
        let index = g.players.findIndex(e=>e.id==g.turn_started_by);
        g.whose_turn = (index + 1)
      }
      else if(g.hasOwnProperty('turn_will_start_by')){
        g.whose_turn = g.players.findIndex(e=>e.id==g.turn_will_start_by)
        delete g.turn_will_start_by;
      }
      else{
        g.whose_turn=0
      }
      
    }
    //fresh turn



    //old turn
    else{

      if(!g.last_played){
        g.whose_turn=0;
      }

      log(g.last_played);

      //get the id and position of last player, then set the player to next player
      let index = g.players.findIndex(e=>e.id==g.last_played);
      g.whose_turn = (index + 1)

      if(g.whose_turn >= g.players.length ){
        g.whose_turn = 0;
      }

      //check if user is already passed, then dont allow him
      let c=true;
      let player_id;
      let loop_count=0;
      let turn_over=0;

      log('in  of loop'+202);
      log('g.whose_turn '+g.whose_turn);
      log(g.turn_passed);

      while(c){

        //if all members passsed then, start new turn
        if(loop_count >= g.players.length){
          c=false;
          turn_over=1;
        }

        

        //get the player id
        //check if user had passed already in this turn, then allot the next user
        //check if user is competed, dont allo to complete users
        if(
          g.turn_passed.includes(g.players[g.whose_turn].id) || 
          g.completed_players.includes(g.players[g.whose_turn].id)
        ){
          g.whose_turn++;
        }
        else{
          c=false;
        }

        
        //if index crossed max length, set it to 0
        if(g.whose_turn >= g.players.length ){
          g.whose_turn = 0;
        }

        loop_count++;
      }

      log('out of loop loop_count:'+loop_count);
      log('g.whose_turn '+g.whose_turn);
  


      //this turn is over so start next fresh turn
      if(turn_over){
        g.start_turn();
        return;
      }


    }
    //old turn

    




    //at end of array, reset to user at index 0
    if(g.whose_turn>= g.players.length ){
      g.whose_turn = 0;
    }

    log('831');
    log(g.whose_turn);
    log(g.players[g.whose_turn].id);

    let payload = {
      whose_turn:g.players[g.whose_turn].id,
      turn_call : g.turn_call
    };

    if(fresh_turn){
      payload.fresh_turn=1
    }

    log(payload);
    log('--------end of start-turn-------');


    mqtt.send(mqtt.game_topic,{
      game:payload
    });

  }






  distribute_card(){
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
      log('sending cards to '+e.id);
        //unicast to user's id topic
        mqtt.send('USER/'+e.id,{
          game:{
            player_id : e.id,
            cards_received : card_for_user[i],
            initial : 1,
            round : g.round
          }
        })
    });
  }

  /*----------------for host-------------------*/

}



