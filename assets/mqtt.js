


/*------------------------

Mqtt Communication

------------------------*/


class MqttCommunication{
	constructor(){

        this.topic_base = `bm.xbl.com/bm/`;
		this.global_topic = 'global/1';
		this.server_topic = 'SERVER/1';
		

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
			mqtt.client = new Paho.MQTT.Client(getEndpoint(), t.client);


			mqtt.client.onConnectionLost = mqtt.onConnectionLost;
			mqtt.client.onMessageArrived = mqtt.onMessageArrived;


			mqtt.client.connect({ 
				useSSL: true, 
				timeout: 3, 
				mqttVersion: 4, 
				onSuccess:mqtt.onConnect,
				onFailure:mqtt.try_reconnect,
			}); 

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

		mqtt.subscribe(mqtt.global_topic);
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
	  	m = JSON.parse(m.payloadString);
	  	console.log(m);

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
			log(m);

			if(t.details.id == m.authenticated && m.client != t.client){
				notif('Your account was logged in from another device');
				setTimeout(()=>{logout()},1500)
			}
		}
		else if(m.ping){
			mqtt.send(mqtt.server_topic,{pong:1})
		}
		else if(m.disconnect){
			delete mqtt.host;

			mqtt.client.disconnect();
			notif("You were disconnected from server");
		}

		else{
			log("mqtt Message Arrived");
			log(m);
		}
	}











}


/*
to check how many user is connected
broadcast

mqtt.send(global_topic,{ping:1})
data wil lbe received in server_topic
--------

to disconnect all clients 
mqtt.send(global_topic,{disconnect:1})

*/




const IOT_ENDPOINT = "axc0ulezixlpw-ats.iot.ap-south-1.amazonaws.com";

// example: us-east-1 
const REGION = "ap-south-1";   

// your AWS access key ID 
const KEY_ID = "AKIA3EJXHCZTXXRJ7RZ7"; 

// your AWS secret access key 
const SECRET_KEY = "66qI2iaK+VJrYI+TmLQqA4i9lb1sTrV52f6WrVJP"; 







function getEndpoint() { 


	    // date & time 
	    const dt = (new Date()).toISOString().replace(/[^0-9]/g, ""); 
	    const ymd = dt.slice(0,8); 
	    const fdt = `${ymd}T${dt.slice(8,14)}Z` 
	    
	    const scope = `${ymd}/${REGION}/iotdevicegateway/aws4_request`; 
	    const ks = encodeURIComponent(`${KEY_ID}/${scope}`); 
	    let qs = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ks}&X-Amz-Date=${fdt}&X-Amz-SignedHeaders=host`; 
	    const req = `GET\n/mqtt\n${qs}\nhost:${IOT_ENDPOINT}\n\nhost\n${p4.sha256('')}`; 
	    qs += '&X-Amz-Signature=' + p4.sign( 
	        p4.getSignatureKey( SECRET_KEY, ymd, REGION, 'iotdevicegateway'), 
	        `AWS4-HMAC-SHA256\n${fdt}\n${scope}\n${p4.sha256(req)}`
	    ); 
	    return `wss://${IOT_ENDPOINT}/mqtt?${qs}`; 
	} 



function p4(){} 
p4.sign = function(key, msg) { 
    const hash = CryptoJS.HmacSHA256(msg, key); 
    return hash.toString(CryptoJS.enc.Hex); 
}; 
p4.sha256 = function(msg) { 
    const hash = CryptoJS.SHA256(msg); 
    return hash.toString(CryptoJS.enc.Hex); 
}; 
p4.getSignatureKey = function(key, dateStamp, regionName, serviceName) { 
    const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key); 
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate); 
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion); 
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService); 
    return kSigning; 
};
