require('dotenv').config();
const request = require('request');
const {SURL,USERK,USERP,endURL,cKey} = require('./config');
const {sortData} = require('./utils/sortData');
const {addSeconds,subtractTime,addTime} = require('./utils/addTime');
let counter = 0;
//use these to store the data from get calls
let erpSortedData = [];
let shopifySortedData = [];
let executeTime ={updated:true};
//update/post arrays for the different shopify calls
let putData = [];
let postData = [];

/**********************************************
This version running off of running async get request for ERP and Shopify
other version idea get ERP data then get Shopify data  then compare

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
		const currentTime = Math.round(new Date().getTime() / 1000);
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
		const currentTime = Math.round(new Date().getTime() / 1000);
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

function compareData2(){
	//arr1 has to be ERP and arr2 has to be Shopify data, because of how the object naming,will have to change when using real ERP API

	let checkedCounter = 0;
	console.log("erp array",erpSortedData);
	for(let i = 0;i < erpSortedData.length - 1; i++){
		
		if (checkedCounter === shopifySortedData.length - 1){
			postData.push(erpSortedData[i]);
			continue;
		}
		
		console.log("erp in for loop: ",erpSortedData[i].name.toLowerCase());
		for(let k =0; k < shopifySortedData.length -1; k++){
			console.log("shopify in for loop: ",shopifySortedData[k].title.toLowerCase());
			console.log("erp in for loop: ",erpSortedData[i].name.toLowerCase());
			if(shopifySortedData[k].productChecked){
				console.log("skipping----------");
				continue;
			}
			//means data exists in both
			else if(shopifySortedData[k].title.toLowerCase() === erpSortedData[i].name.toLowerCase()){
				console.log("found");
				shopifySortedData[k].productChecked = true;
				checkedCounter++;
				putData.push(erpSortedData[i]);
				break;
			}
			else if(shopifySortedData[k].title.toLowerCase() < erpSortedData[i].name.toLowerCase()){
				//this condition means that the name from shopifySortedData does not come alphabetically after the current erpSortedData item name therefore this would be new data to add to shopify
				console.log("erp data comes alphabetically after continue searching------------");
				shopifySortedData[k].productChecked = true;
				checkedCounter++;
				continue;
			}
			//else if()
			
			else if(!(shopifySortedData[k].title.toLowerCase() < erpSortedData[i].name.toLowerCase())){
				//this condition means that the arr2 name comes alphabetically after the current item. Therefore should be able to continue to next k,if the name has not been found yet
				//means thing does not come alphabetically after
				console.log("data pushed to post data-----------");
				postData.push(erpSortedData[i]);
				break;
			}
			
		}
	}
	console.log("This is the put Data =========",putData);
	console.log("This is the post Data =========",postData);
}

function compareData(arr1,arr2){
	//arr1 has to be ERP and arr2 has to be Shopify data, because of how the object naming,will have to change when using real ERP API

	//let checkedCounter = 0;
	console.log("erp array",arr1);
	for(let i = 0;i < arr1.length; i++){
		/*
		if (checkedCounter === arr2.length - 1){

		}
		*/
		console.log("erp in for loop: ",arr1[i].name.toLowerCase());
		for(let k =0; k < arr2.length; k++){
			console.log("shopify in for loop: ",arr2[k].title.toLowerCase());
			console.log("erp in for loop: ",arr1[i].name.toLowerCase());
			if(arr2[k].productChecked){
				continue;
			}
			//means data exists in both
			else if(arr2[k].title.toLowerCase() === arr1[i].name.toLowerCase()){
				console.log("found");
				arr2[k].productChecked = true;
				putData.push(arr1[i]);
			}
			else if(arr2[k].title.toLowerCase() < arr1[i].name.toLowerCase()){
				//this condition means that the name from arr2 does not come alphabetically after the current arr1 item name therefore this would be new data to add to shopify
				arr2[k].productChecked = true;
				postData.push(arr1[i]);
			}
			
			else if(!(arr2[k].title.toLowerCase() < arr1[i].name.toLowerCase())){
				//this condition means that the arr2 name comes alphabetically after the current item. Therefore should be able to continue to next k,if the name has not been found yet
				continue;
			}
			
		}
	}
	console.log("This is the put Data =========",putData);
	console.log("This is the post Data =========",postData);
}

function compareDataInit(){
	//catch error thrown by initialization of sorted array variables
	try{
		const today = new Date();
		let currentTime = Math.round(today.getTime() /1000);
		let expectedTime;
		const erpTimeAdded = erpSortedData[erpSortedData.length -1];
		const shopifyTimeAdded = shopifySortedData[shopifySortedData.length -1];
		console.log("data time added erp ",erpTimeAdded);
		console.log("data time added shopify ",shopifyTimeAdded);
		//const expectedTimeERP = addSeconds(erpTimeAdded,10);
		//const expectedTimeShopify = addSeconds(shopifyTimeAdded,10);
		const expectedTimeERP = addTime(erpTimeAdded,10);
		const expectedTimeShopify = addTime(shopifyTimeAdded,10);
		console.log("Expected time for new data ERP", expectedTimeERP);
		console.log("Expected time for new data Shopify", expectedTimeShopify);
		console.log("Current time", currentTime);
		console.log(executeTime);
		//make executeTime object to add the ability to check if it has been updated or not
		if(expectedTimeERP > expectedTimeShopify && executeTime.updated){
			executeTime.time = expectedTimeERP;
			executeTime.updated = false;
		}
		else if(expectedTimeERP <= expectedTimeShopify && executeTime.updated){
			executeTime.time = expectedTimeShopify;
			executeTime.updated = false;
		}

		if(currentTime === executeTime.time){
			console.log("time to compare data");
			compareData(erpSortedData,shopifySortedData);
			executeTime.updated = true;
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
	setTimeout(compareData2,15000);
}

module.exports = {startCalls};