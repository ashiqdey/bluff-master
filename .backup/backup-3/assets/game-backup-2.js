
class Game{
  constructor(){

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
          
          <div class="flex aic">
            <img src="icon/king.svg" class="ic25">
            <span class="f12 bold ml10">Round - <span class='round_no'></span></span>
          </div>
          <!--div class="flex aic">
            <div class="ic40 ic p5"><img src="icon/mic.svg" class=""></div>
            <div class="ic40 ic p5 ml10"><img src="icon/chat.svg" class=""></div>
            <div class="ic40 ic p5 ml10"><img src="icon/3dot.svg" class=""></div>
          </div-->


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
        //mqtt.subscribe(mqtt.host_topic)

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
    log('----------start render-fresh-turn----------');
    
    g.turn_of_id = player_id;


    //make all players inactive
    $(`#players .player`).attr('active','0')


    if(fresh_turn){
      g.old_cards_on_table = [];
      g.latest_cards_on_table = [];

      //when fresh turn starts, empty all passed members
      g.passed_players = [];

      //empty the table
      g.total_cards_on_table = [];

      g.empty_table();
    }
    


    //if this is target player then opne card window
    if(player_id == t.details.id){


      //check if this user already passed in this turn, then pass
      //or this user have no cards
      if(
        g.turn_passed.includes(t.details.id) ||
        g.my_cards.length==0
      ){
        log("i m passing - 363");
        //0 = dont display chat text, because its auto pass
        g.i_pass(0)
        return;
      }
      else{
        //open card window
        g.card_window(1)



        /*------disable, enable call selector-----*/
        //if turn_call is valid then disable it lese, allow to choose his own call
        $("#card_no_chooser input[name='call']").prop('disabled',(g.turn_call ? true:false))
        
        //select the turn call  button, when turn call is passed
        if(g.turn_call){
          $(`#card_no_chooser input[name='call'][value='${g.turn_call}']`).prop('checked',true)
        }
        //else remove the select button
        else{
          $(`#card_no_chooser input[name='call']:checked`).prop('checked',false)
        }
        /*------disable, enable call selector-----*/



        //close exising timer
        if(g.timer_waiting_to_pass){
          clearTimeout(g.timer_waiting_to_pass)
        }
        //allow 10 sec to put cards
        g.timer_waiting_to_pass = setTimeout(g.i_pass,(g.turn_time * 1000));
      
      }

      
    }
    else{
      //show animation if player if my opponent
      $(`#players .player[player-id='${player_id}']`).attr('active','1')
    }






    log('----------end render-fresh-turn----------');
  }





  /*
  admin will call this function 
  current playing player's info will be passed, alter UI accordingly
  */
 /*
  render_current_player(m){
    log('----------start render_current_player----------');
    log(m)

    g.turn_call = m.turn_call;
    g.current_player = m.whose_turn;




    //make all players inactive
    $(`#players .player`).attr('active','0')
    
    if(m.fresh_turn){
      //when fresh turn starts, empty all passed members
      g.turn_passed=[]

      //empty the table
      g.total_cards_on_table = [];
      $('#cards_on_table_count').text(0)

      $(`#users_call`).text('')
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


        //------disable, enable call selector-----
        //if turn_call is valid then disable it lese, allow to choose his own call
        $("#card_no_chooser input[name='call']").prop('disabled',(g.turn_call ? true:false))
        
        //select the turn call  button
        if(g.turn_call){
          $(`#card_no_chooser input[name='call'][value='${g.turn_call}']`).prop('checked',true)
        }



        //close exising timer
        g.stop_pass_timer();

        //allow 10 sec to put cards
        g.timer_waiting_to_pass = setTimeout(g.i_pass,(g.turn_time * 1000));
      }

      

      
    }
    else{
      //show animation if player if my opponent
      $(`#players .player[player-id='${m.whose_turn}']`).attr('active','1')
    }


    log('----------end render_current_player----------');


  }
*/




  stop_pass_timer(){
    if(g.timer_waiting_to_pass){
      clearTimeout(g.timer_waiting_to_pass)
      delete g.timer_waiting_to_pass;
    }
  }




  i_pass(text=1){
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
    g.stop_pass_timer()


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
  


    form.map((e) => {
      if(e.name=='selected_cards'){
        payload.cards.push(e.value)
      }
      if(e.name=='call' && !g.turn_call){
        //no call exists so allow to pass new call
          payload.turn_call = e.value;
          my_call_is=1;
      }
    });

    if(payload.cards.length==0){
      notif("Choose atleast 1 card or PASS");
      return;
    }

    else if(!my_call_is){
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


    //close card window
    g.card_window(0)


    //pass cards i have to  all members
    payload.cards_have = g.my_cards.length

    
    //send message to all, saying my playing details
    mqtt.send(mqtt.game_topic,{game : {cards_played : payload}})

  }















  cards_played(m){
    log('---------------start cards_played-------------');
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
    g.old_cards_on_table = g.old_cards_on_table.concat(g.latest_cards_on_table);

    //hold the lastes cards on table
    g.latest_cards_on_table = m.cards;

    g.last_played_id    = m.pid;
    g.cards_have        = m.cards_have;
    g.cards             = m.cards;
    g.last_played_index = g.get_player_index(m.pid);
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
    $('#users_call').html(`<span class='o6 count'>${m.cards.length}X</span> &nbsp; ${g.turn_call}`);

    //----update card count-----already deducted for self - --
    if(m.pid != t.details.id && m.hasOwnProperty('cards_have'))
      g.render_card_count({[m.pid] : m.cards_have});

    //add cards to table count
    $('#cards_on_table_count').text(g.old_cards_on_table.length + g.latest_cards_on_table.length);

    //render the lastest card on table
    g.render_lastet_card_on_table();

    //show user profile
    $('#user_played').html(`<div class="dp ic50 b3sf br30 greyd bsc" style="background-image:url(img/dp/${player.id}.jpg)"></div><div class="name pa white cgrey7 br20 p5 lc1 f08 bold">${player.name}</div>`);

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

    log('---------------end cards_played-------------');

  }




  clear_next_timer(){
    if(g.next_call_timer){
      clearTimeout(g.next_call_timer);
      delete g.next_call_timer;
    }
  }



  new_winner(pid,score=0){
    if(g.winners.includes(pid))return;

    g.winners.push(pid);

    score = g.players.length - Object.keys(g.score_card).length;
    log(`NEW winner iD:${pid}, score : ${score}`);

    if(g.score_card[id]){
      g.score_card[id].push(score)
    }
    else{
      g.score_card[id] = [score]
    }
  }




  /*
  render the latest cards on table
  */
  render_lastet_card_on_table(){
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

    log(g.old_cards_on_table);

    //this will be called after 910 - 2) sec from the time of card playing

    //hide bluff button
    $("#bluff").hide();

    g.old_cards_on_table = g.old_cards_on_table.concat(g.latest_cards_on_table);

    //take lastet cards to  old
    g.add_last_cards_to_old();

    //clean table, add last cards to old cards
    let c='';
    let max = (g.old_cards_on_table.length > 12 ? 12 : g.old_cards_on_table.length)
    for(let ic=0;ic<max;ic++){
      c += '<div class="card"><div class="img_holder pr"><img src="img/card.webp" class="w100 br6"></div></div>';
    }
    $("#oldcards").html(c);
    $("#cards_on_table_count").html(g.old_cards_on_table.length);

    //remove lastest cards
    $('#latest_card').html('');
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

 
    //if bluff failed, accecpt the cards
    if(!bluffed){
      g.my_cards = g.my_cards.concat(g.lastest_cards_on_table);
      g.render_my_cards();
    }

    


    log(`won by: bluffed:${bluffed} , `+(bluffed ? t.details.id : g.last_played_id));

    //send message to all
    mqtt.send(mqtt.game_topic,{
      game:{
        bluff:{
          bluffed_by : t.details.id,
          bluffed_to : g.last_played_id,
          cards : g.total_cards_on_table,
          won : (bluffed ? t.details.id : g.last_played_id)
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


    g.clear_next_timer();
    g.stop_bluff_timer();


    //empty the table, and adjust table
    g.old_cards_on_table = [];
    g.lastest_cards_on_table = [];
    g.empty_table();



    //stop animtion
    $(`#players .player`).attr('active','0');
    

    //this is the victim (not won)
    if(to.id == t.details.id && m.won!=t.details.id){
        //accept all cards
        g.my_cards = g.my_cards.concat(m.cards);
        g.render_my_cards();
    }


    //alter card counter
    let looser = (m.won == by.id) ? to.id : by.id;

    g.player_card_count[looser] += m.cards.length
    g.render_card_count({[looser] : g.player_card_count[looser]})

    log(`cards counter for looser, user=${looser} : `+g.player_card_count[looser]);





    
    
    if(t.host){
      log('---- bluffed -- I AM HOST');

      g.clear_next_timer();
      //automatically call for fresh turn after 3 sec
      g.next_call_timer = setTimeout(g.start_fresh_turn, (3 * 1000));

      //who ever won will start the next turn
      //so set the last index to winner - 1
      g.turn_started_by_index =  g.get_player_index(m.won) - 1;

    }
  }

/*----------bluff--------*/




















  card_window(open=1){
    $('#card_window').attr('show',open);

    if(window.innerWidth < 900){
      if(open){
        $("#table").css({'top':'-45px'})
      }
      else{
        $("#table").css({'top':'55px'})
      }
    }
  }




  render_new_round(m){
    $('.round_no').text(m);

    //clear table
  }



  messageArrived(m){
    


    if(m.new_round){
      //m.new_round = round no.
      g.render_new_round(m.new_round);
    }
    else if(m.start_round){
      g.start_round()
    }


    else if(m.fresh_turn){
      //m.fresh_turn = id of player who will start the turn
      g.render_current_turn(m,1)
    }

    else if(m.next_turn){
      //next_turn : g.turn_of_id,
      g.render_current_turn(m,0)
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

    g.empty_table();
    $('#card_window .wrap').html('');
    $('#players .player').attr('count','0');
  }









    
  /*----------------for host-------------------*/
  
  init_round(){
    log('--------------------init_round------------------------');
    setTimeout(g.distribute_card,500)

    g.winners             = []
    g.score_card          = {}
    g.round               = (!g.round) ? 1 : (g.round+1);
    g.players_ready       = 0;
    g.cards_with_players = {}


    mqtt.send(mqtt.game_topic,{
      game:{
        new_round : g.round
      }
    });


  }



  start_round(){
    if(t.host){
      g.players_ready++;

      if(g.players_ready >= g.players.length){
        console.log("everybody is ready, make first turn");
        g.start_turn();
      }
    }
  }





  get_next_player_index(p){
    p++;
    return (p >= g.players.length)?0:p;
  }


  get_player_id(index){
    return g.player[index].id;
  }

  get_player_index(id){
    return g.player.findIndex(e=>e.id==id)
  }



  start_fresh_turn(){
    log('--------start of start-fresh-turn-------');


     //check how many player have cards with them
     let players_with_cards = Object.keys(g.player_card_count).filter(e => g.player_card_count[e] > 0)

     //only 1 player is having cards
     if(players_with_cards.length == 1){
       log('all completed, now start new round');
       g.init_round();
     }





/*
    g.turn_of_id            = id of player who played last
    g.turn_started_by_index = index of player who played last
    g.last_played_index     = id player who played last card
    g.turn_count            = no. of turn goin on
    g.passed_players        = [] , id of player who passed
    g.turn_call             = 0 , call of this turn
*/


    g.passed_players = [];

    //no one playeed yet
    g.last_played_id=-1;

    //set turn count
    g.turn_count = g.turn_count ? (g.turn_count+1) : 1;


    let allowed_to_start_turn=0;
    let loop=0;

    while(!allowed_to_start_turn){

      //looped for all user, no one is allowed to play cards, so start fresh round
      if(loop >= g.players.length){
        g.init_round();
        allowed_to_start_turn=1;
        return;
      }


      //who will start the turn
      if(!g.hasOwnProperty(g.turn_started_by_index)){
        g.turn_started_by_index = getRandom(0,g.players.length-1);
      }
      else{
        g.turn_started_by_index = g.get_next_player_index(g.turn_started_by_index)
      }


      //fresh turn so turn will be started by g.turn_started_by
      g.turn_of_id = g.get_player_id(g.turn_started_by_index)


      //if the player have cards to play, the allo w him to start turn
      if(g.cards_with_players[g.turn_of_id] > 0){
        allowed_to_start_turn = 1;
      }


      loop++;
    }
    

    
    mqtt.send(mqtt.game_topic,{
      game:{
        fresh_turn : g.turn_of_id
      }
    });

    log('--------end of start-fresh-turn-------');

  }







  
  start_next_turn(){
    log('--------start of start-next-turn-------');

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
      g.new_winner(m.pid)
    }

      //no longer requried
      delete g.cards_have;


      //if all user passed, then start new turn
      if((g.winners.length + g.passed_players.length) >= g.players){
        log('all completed, now start new turn');
        g.start_fresh_turn();
      }




    let allowed_to_start_turn=0;
    let loop=0;

    while(!allowed_to_start_turn){

      //looped for all user, no one is allowed to play cards, so start fresh round
      if(loop >= g.players.length){
        g.init_round();
        allowed_to_start_turn=1;
        return;
      }



      //who will start the turn
      g.last_played_index = g.get_next_player_index(g.last_played_index)

      g.turn_of_id = g.get_player_id(g.last_played_index)


      //if the player have cards to play, 
      //&& he haven't pass yet, the allow him to start turn
      if(g.cards_with_players[g.turn_of_id] > 0 && !g.passed_players.includes(g.turn_of_id)){
        allowed_to_start_turn = 1;
      }
  

      loop++;
    }
    

    
    mqtt.send(mqtt.game_topic,{
      game:{
        next_turn : g.turn_of_id,
        turn_call : g.turn_call
      }
    });

    log('--------end of start-next-turn-------');

  }








/*
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
*/





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
        //unicast to user's id topic
        mqtt.send('USER/'+e.id,{
          game:{
            player_id : e.id,
            cards_received : card_for_user[i],
            initial : 1,
          }
        })
    });
  }

  /*----------------for host-------------------*/

}



