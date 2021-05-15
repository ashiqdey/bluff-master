


/*------------------------

Mqtt Communication

------------------------*/


class MqttCommunication{
	constructor(){
		//this.host = 'test.mosquitto.org';
		//this.port = 8080;

		

		this.host = 'maqiatto.com';
		this.port = 8883;

		this.user = 'ashiqdey@gmail.com'
		this.password = 'qwerty123'



        //this.topic_base = `bm.xbl.com/bluff_master/`;
        this.topic_base = `ashiqdey@gmail.com/bfm/`;

		this.client;
		this.connected=false;
		this.reconnect_interval=1;
	}



	increase_reconn_interval(ri){
        const m = {
            'reset':1,
            '1':3,
            '3':5,
            '5':10,
            '10':20,
            '20':60,
            '60':60,
        }

        mqtt.reconnect_interval = m[ri];
	}



	connect(){
		try{
			mqtt.increase_reconn_interval(mqtt.reconnect_interval);

			// Create a client instance
			mqtt.client = new Paho.MQTT.Client(mqtt.host, mqtt.port, "");

			// set callback handlers
			mqtt.client.onConnectionLost = mqtt.onConnectionLost;
			mqtt.client.onMessageArrived = mqtt.onMessageArrived;

			let connect_option={
				onSuccess: mqtt.onConnect,
				onFailure: mqtt.try_reconnect
			}
			
			if(mqtt.user && mqtt.password){
				connect_option.userName=mqtt.user;
				connect_option.password=mqtt.password;
			}

			// connect the client
			mqtt.client.connect(connect_option)


		}
		catch(err){
			console.log('mqtt connect err');
			console.log(err);
		}
	}


	onConnect(){
		log("---MQTT Connected");

		mqtt.connected=true;
		mqtt.increase_reconn_interval('reset');
	}

    subscribe(topic,callback=log){
       try{
		log('subscribing to '+topic);

		mqtt.client.subscribe(mqtt.topic_base+topic,{onSuccess:callback});
	   }
	   catch(e){
		log(e);
	   }
    }

	unsubscribe(topic){
        log('unsubscribing from '+topic);
		mqtt.client.unsubscribe(mqtt.topic_base+topic,{onSuccess:function(){log('unsubscribed from '+topic)}});
    }

	


	onConnectionLost(responseObject){
	  if (responseObject.errorCode !== 0){
	  	mqtt.connected=false;
		log("onConnectionLost:"+responseObject.errorMessage);
		mqtt.try_reconnect();
        notif("Connection lost");
	  }
	}




	try_reconnect(){
		if(!mqtt.connected){
			notif("Reconnecting...("+mqtt.reconnect_interval+"s)");
			setTimeout(mqtt.connect,mqtt.reconnect_interval);
		}
	}



	


	send(topic,payload={}){
		//log("=== mqtt emision, publishing");
		//log(topic,payload);

		
		if(mqtt.connected){
			let mgs = new Paho.MQTT.Message(JSON.stringify(payload));
			mgs.destinationName = mqtt.topic_base + topic;
			mqtt.client.send(mgs);
		}
		else{
			log("not published : " + JSON.stringify(payload));
		}
	}


	onMessageArrived(m){
		m = m.payloadString;

		
		

	  	m = JSON.parse(m);


	
	 	if(m.waiting_hall){
			if(wh){
				wh.messageArrived(m.waiting_hall)
			}
		}
		else if(m.game){
			if(g){
				g.messageArrived(m.game)
			}
		}
		else if(m.authenticated){
			if(m.client != t.client && t.details && t.details.id == m.authenticated){
				notif('Your account was logged in from another device');
				window.location = 'logout';
			}
		}

		else{
			log("mqtt Message Arrived");
			log(m);
		}
	}



}










