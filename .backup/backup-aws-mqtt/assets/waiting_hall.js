
class Waiting_hall{
	constructor(){
		this.members_waiting=[];

		t.page = "waiting_hall";


		if(!t.active_room){
			//check if room is available in localstoarge
			if(check_ws('rooms')){
				let rooms = fetch_ws('rooms');

				//make the first room as active
				if(rooms.length>0){
					t.active_room = rooms[0];
					no_room=0;
				}
			}
		}





		
		$(document).on('click','.reject_from_wh',function(){
			wh.reject_from_waiting_hall($(this).attr('player-id'));
		})


		$(document).on('click','.accept_to_wh',function(){
			wh.accept_to_waiting_hall($(this).attr('player-id'));
		})


		$(document).on('click','#start_game',function(){

			if(wh.accepted_members.length<2){
				notif("Atleast 2 members are required to start game");
				return;
			}

			mqtt.send(mqtt.room_topic,{
				waiting_hall:{
					start_game : t.game_id,
					members : wh.accepted_members
				}
			})
		})

		$(document).on('click','#leave_waiting',function(){
			wh.reject_from_waiting_hall(t.details.id);
			forward_hash('room');
		})
		
		

	}







	render_waiting_hall(){

		//set the game id, only by admin
		if(t.active_room.user == t.details.id){
			t.host = 1;
			t.game_id = `${new Date().getTime()}${t.active_room.id}`
		}
		else{
			t.host = 0;
		}


		wh.accepted_members=[
			{
				id:t.details.id,
				name:t.details.name,
				dp:t.details.dp,
				host:1
			}
		];
		
		
		
		$('#app').html(`
			<div class="p20 mw400 mcen">
				<h2 class="f1 cgrey9 whitebg p15 br10 bold">Room ID : ${t.active_room.name}</h2>


				`+(!t.active_room.user==t.details.id ? ``:`<!--div class="whitebg br10 mt20">
						<div class="ninput bor0 hide_label">
							<input type="text" name="" placeholder=".">
							<label>Search player...</label>
							<div class="ic50 pa r0 t0 f2 ic cgreya">&times;</div>
						</div>
						<div id='result_search_player' result='0' class="tc">
							<hr><div class="results p10"></div>
						</div>
					</div-->`
				)+`
				

				<h2 class="f08 o8 cgrey9 bold mt40">Waiting hall</h2>
				<div class="whitebg br10 mt20 p10" id="members_waiting"></div>
				
				
				${(t.active_room.user==t.details.id?`<button class="but fat theme w100 mt50" id='start_game'>START GAME</button>`:`<div class='tc mt50 cgrey9'>Please wait until host starts the game</div><button class="but fat redl w100 mt50" id='leave_waiting'>LEAVE</button>`)}

			</div>`);

		wh.render_search_default();



		

	}



	entered_room(){
		/*
		boardcast a message to get list of all waiting members in waiting room
		*/

	  	//wh.i_am_waiting();
		
		mqtt.send(mqtt.room_topic,{
			waiting_hall : {are_you_waiting:t.active_room.id}
		})
	}





	render_search_default(players = []){

		if(check_ws('recent_players')){
			players = fetch_ws('recent_players');
		}

		$("#result_search_player").attr('result',players.length);
		$("#result_search_player .results").html(players.map(make).join(''));


		function make(e,i){
			//render fonly first four players
			if(i<4){
				return `<div class="p10 flex jcsb aic" player-id='${e.id}'>
					<div class="flex aic w70">
						<div class="ic40 greyd br50"></div>
						<div class="f11 cgrey5 ml10">${e.name}</div>
					</div>
					<!--button class="but mbut trans cgreya w30">Invited</button-->
					<button class="but mbut theme w30 invite" player-id='${e.id}'>Invite</button>
				</div>`
			}
			else{
				return '';
			}
		}
	}






	
	


	





	


	/*------------accept, reject----------------*/

	reject_from_waiting_hall(player_id){
		player_id = parseInt(player_id);

		//reject the member from waiting hall, change ui, send message, send mqtt, BY ADMIN
		wh.player_rejected(player_id);
		mqtt.send(mqtt.room_topic,{waiting_hall:{rejected:player_id,room_id:t.active_room.id}})
	}

	accept_to_waiting_hall(player_id){
		player_id = parseInt(player_id);

		//accept the member to waiting hall, change UI, send mqtt, BY ADMIN
		wh.player_accepted(player_id);
		mqtt.send(mqtt.room_topic,{waiting_hall:{accepted:player_id,game_id:t.game_id}})

		let player = wh.members_waiting.find(e=>e.id==player_id);
		wh.accepted_members.push(player);
	}

	player_rejected(player_id){
		sfx.bluffed();
		$(`.player[player-id='${player_id}']`).remove();
	}
	player_accepted(player_id){
		sfx.bluffed();
		$(`.player[player-id='${player_id}'] .btn_holder`).html(`<div class='f08 o6'>Accepted</div>`);
	}

	/*------------accept, reject----------------*/











	messageArrived(m){
		log("--- WH messageArrived");
		log(m);


		if(m.are_you_waiting){
			//when someone will broadcast message {are_you_waiting:ROOM_ID} this function will be called
			//check if i am in this waiting hall, then send resposne

			if(t.active_room.id == m.are_you_waiting){
				//yes i m waiting in room XYZ
				wh.i_am_waiting();
			}

		}




		//all members of this waiting room will broadcast this message
		//waiting_in_room & same room ID and details passed
		else if(m.waiting_in_room && m.waiting_in_room == t.active_room.id && m.details){

			//if member doesnt exists in the array, then append to ui
			if(wh.members_waiting.findIndex(e=>e.id==m.details.id) < 0){
				wh.members_waiting.push(m.details);

				log("members_waiting added user_id:"+m.details.id);

				$('#members_waiting').html(wh.members_waiting.map(make).join(''))


				function make(e){
					let buttons;

					//this user is admin, show as host
					if(e.id == t.active_room.user){
						buttons =`<div class='f08 o6'>Host</div>`
					}
					else if(t.active_room.user==t.details.id){
						if(wh.accepted_members.findIndex(f=>f.id==e.id) >-1){
							buttons =`<div class='f08 o6'>Accepted</div>`
						}
						else{
							buttons = `<button class="but mbut red w50 m210 reject_from_wh" room-id="${t.active_room.id}" player-id="${e.id}">Reject</button>
							<button class="but mbut theme w50 ml10 accept_to_wh" room-id="${t.active_room.id}" player-id="${e.id}">Accept</button>`
						}
					}
					else{
						buttons = `<div class='f08 o6'>Waiting</div>`
					}



					//add the member in UI
					return `<div class="p10 flex jcsb aic player" player-id="${e.id}">
						<div class="flex aic w50">
							<div class="ic40 greyd br50 bsc" style="background-image:url(${e.dp})"></div>
							<div class="f11 cgrey5 ml10 ttc">${e.name}</div>
						</div>
						<div class="w50 flex jcc btn_holder">${buttons}</div>
					</div>`;
				}
				

			}
		}


		//if joining request is accepeted by admin
		else if(m.accepted){
			wh.player_accepted(m.accepted);

			//get the game if and save
			t.game_id = m.game_id;
		}


		//if joining request is rejected by admin
		else if(m.rejected){
			
			//remove from array
			wh.members_waiting = wh.members_waiting.filter(e=>e.id!=m.rejected);

			//remove from accepeted list
			if(t.host){
				wh.accepted_members = wh.accepted_members.filter(e=>e.id!=m.rejected)
			}

			//if this is the targeted user then unsubscribe from room, take to room home
			if(m.rejected == t.details.id){
				wh.redirect_to_room(m.room_id)
			}
			//for rest other user just remove the player from ui
			else{
				wh.player_rejected(m.rejected);
			}
			
		}


		else if(m.start_game){
			//unsubscribe from room topic
			mqtt.unsubscribe(mqtt.room_topic);
	
			//delete the room topic
			delete mqtt.room_topic;
	



			//check if this user's name oesnt exists in array
			//user is not in playing list , take him to room home
			if(m.members.findIndex(e=>e.id==t.details.id) < 0){
				log("I am not accepted in this game");
				wh.redirect_to_room(t.active_room.id)
			}
			else{
				log("Lets start the game");


				//create game topic
				t.game_id = m.start_game;
				mqtt.game_topic = 'GAME/'+m.start_game;
				mqtt.host_topic = 'HOST/'+m.start_game;

				

				//subscribe to game topic
				mqtt.subscribe(mqtt.game_topic,wh.game_topic_subscribed)

				if(t.host){
					mqtt.subscribe(mqtt.host_topic);
				}

				//take to game window
				forward_hash('game')


				if(!g){
					g = new Game();
				}

				g.players = m.members;
				g.render_game();
			}

			
		}


	}



	redirect_to_room(room_id){
		mqtt.unsubscribe('ROOM/'+room_id);
		delete t.active_room;
		forward_hash('room');
	}





	i_am_waiting(){
		/*
		will  broadcast a message to all in this room that i am waiting  in this room
		*/
		log('I am waiting user_id:'+t.details.id);

		mqtt.send(mqtt.room_topic,{
			waiting_hall : {
				waiting_in_room : t.active_room.id,
				details : t.details
			}
		});
	}




	game_topic_subscribed(){
		log('game_topic_subscribed');

		//this user is connected to host topic so send host a message that subscribed to you
		mqtt.send(mqtt.host_topic,{game:{i_subscribed:t.details.id}});
	}




}