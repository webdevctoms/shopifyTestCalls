require('dotenv').config();
const request = require('request');
const {SURL,USERK,USERP,endURL,cKey} = require('./config');
const {sortData} = require('./utils/sortData');
let counter = 0;
/**********************************************

can make 4 calls/second with shopify plus
retrieve 250 objects with one api call
Use web hooks?
	does this need to also send data to ERP system?
	or can we just make request to ERP and then use code on ERP side to update
	could allow creation of products on shopify and testThing

************************************************/

//callback for shopify post request
function shopifyCallbackPost(error,response,body){
	//const parsedBody = JSON.parse(body);
	//console.log("post data",body);
	console.log("post made");
}

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
		//console.log("successful call",parsedBody);
		console.log("successful call");
	}
	else{
		//just stop functioning if api error
		console.log("failed call", parsedBody.errors);
	}
}

function erpCallbackGet(error,response,body){
	try{
		const parsedBody = JSON.parse(body);
		if(error){
			console.log("erp error ",error);
			throw "unknown error";
		}
		//handle errors from the mock server
		//console.log("erp response ",response);
		if(parsedBody.err){
			console.log("custom error",parsedBody);
			throw "custom error"
		}
		console.log("erp data ",parsedBody);
		const sortedBody = sortData(parsedBody.data);
		console.log("sorted data", sortedBody);
	}
	catch(err){
		console.log("A error occured",err);
	}
}
//initial shopify get request
function shopifyGetCall(){

	const authKey = Buffer.from(USERK + ":" + USERP).toString('base64');
	const options = {
		url:SURL,
		headers:{
			"Authorization": "Basic " + authKey
		}
	};

	request(options,shopifyCallbackGet);

}
//todo
//first make post request to shopify
//then try to make that call every minute just as a test
function shopifyPostCall(){
	const authKey = Buffer.from(USERK + ":" + USERP).toString('base64');
	let title = "server increment product " + counter.toString();
	counter++;
	const options = {
		method:"POST",
		url:SURL,
		headers:{
			"Authorization": "Basic " + authKey

		},
		json: true,
		body:{
			  "product": {
			    "title": title,
			    "body_html": "<h1>From server</h1> <p> a test paragraph</p>",
			    "vendor": "Burton",
			    "product_type": "Snowboard",
			    "images": [
			      {
			        "src": "https://system.na1.netsuite.com/core/media/media.nl?id=789896&c=3760720&h=686ec05f7a777e1168d0&vid=-TglkdtpArucn7FT&chrole=17&ck=8KUe28BpAmur5O9m&cktime=158172&cart=32352&promocode=&promocodeaction=overwrite&sj=toFWmNtUpOtHop9BLqLkOQRin%3B1543347683666&gc=clear",
			        "alt":"test alt text"
			      }
			    ]
			  }
			}
	};

	request(options,shopifyCallbackPost);
}

function getERPData(){
	options = {
		method:"GET",
		url:endURL,
		headers:{
			"Authorization": cKey

		}
	};

	request(options,erpCallbackGet);
}

//test function to try running code while calls are being made
function testThing(str){
	console.log("test thing" + str);
}

function afterGet(str){
	console.log("test after get" + str);
}
//need to make get request to ERP and shopify compare them, then make post/put requests to shopify, so on success of get calls make post call
//could have one setinterval then on each success make get req, post, then put
function startCalls(){
	setInterval(shopifyGetCall,10000);
	setInterval(getERPData,10000);
	//setInterval(shopifyPostCall,10000);
	//setInterval(testThing, 2000);
}

module.exports = {startCalls};