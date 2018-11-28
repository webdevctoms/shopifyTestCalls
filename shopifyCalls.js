require('dotenv').config();
const request = require('request');
const {SURL,USERK,USERP} = require('./config');

//callback for the shopify get request
function shopifyCallbackGet(error, response,body){
	
	const parsedBody = JSON.parse(body);
	//left here maybe useful for debugging
	//console.log("Error ", error);
	//console.log("response ", response);
	//console.log("parsed body ", parsedBody);
	//console.log(parsedBody.errors);
	if(!parsedBody.errors){
		//eventually this will have to pass to a function that will compare shopify data with erp data
		console.log("successful call", parsedBody);
	}
	else{
		//just stop functioning if api error
		console.log("failed call", parsedBody.errors);
	}
}
//initial shopify get request
function shopifyGetCall(){
	//console.log(Buffer.from(USERK + ":" + USERP).toString('base64'));
	const authKey = Buffer.from(USERK + ":" + USERP).toString('base64');
	const options = {
		url:SURL,
		headers:{
			"Authorization": "Basic " + authKey
		}
	};

	request(options,shopifyCallbackGet);

}

module.exports = {shopifyGetCall};