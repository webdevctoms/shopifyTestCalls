require('dotenv').config();
const request = require('request');
const {SURL,USERK,USERP,endURL,cKey} = require('./config');
const {sortData} = require('./utils/sortData');
const {addSeconds,subtractTime} = require('./utils/addTime');
let counter = 0;
//use these to store the data from get calls
let erpSortedData;
let shopifySortedData;
//update/post arrays for the different shopify calls
let putData;
let postData;

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
		const currentTime = new Date().getSeconds();
		//console.log("shopify data ", parsedBody);
		const sortedBody = sortData(parsedBody.products,"title");
		
		sortedBody.push(currentTime);
		//console.log(sortedBody);
		shopifySortedData = sortedBody.slice();
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
		//console.log("erp data ",parsedBody);
		const sortedBody = sortData(parsedBody.data,"name");
		//will have to change second usage to minutes in production
		const currentTime = new Date().getSeconds();
		//console.log("current seconds", currentTime);
		
		sortedBody.push(currentTime);
		console.log("sorted data", sortedBody);
		erpSortedData = sortedBody.slice();
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

function compareData(){
	//catch error thrown by initialization of sorted array variables
	try{
		const today = new Date()
		let currentTime = today.getSeconds()
		let expectedTime;
		const erpTimeAdded = erpSortedData[erpSortedData.length -1];
		const shopifyTimeAdded = shopifySortedData[shopifySortedData.length -1];
		console.log("data time added erp ",erpTimeAdded);
		console.log("data time added shopify ",shopifyTimeAdded);
		const expectedTimeERP = addSeconds(erpTimeAdded,10);
		const expectedTimeShopify = addSeconds(shopifyTimeAdded,10);
		console.log("Expected time for new data ERP", expectedTimeERP);
		console.log("Expected time for new data Shopify", expectedTimeShopify);
		console.log("Current time", today.getSeconds());
		if(currentTime === expectedTimeERP || currentTime === expectedTimeShopify){
			console.log("Time to compare data current time equal to expected");
		}
		//==================
		//Can possibly remove this section if above check handles everything
		//===================
		if(subtractTime(expectedTimeERP,expectedTimeShopify,currentTime)){
			console.log("Erp finished before shopify");
			//use shopify end time to determine when to start comparing
			expectedTime = expectedTimeShopify;
		}
		else{
			console.log("Shopify finished before ERP");
			//use erp end time to determine when to start comparing
			expectedTime = expectedTimeERP;
		}
		//this would handle if this function was called at the same time the data was added,probably will never get called in production
		if(expectedTime === currentTime){
			console.log("final expected time",expectedTime);
			console.log("Time to compare data");
		}
	}
	catch(err){
		console.log("error comparing data", err);
	}
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
	setInterval(compareData,1000);
}

module.exports = {startCalls};