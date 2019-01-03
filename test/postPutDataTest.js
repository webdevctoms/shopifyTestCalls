const chai = require('chai');
const expect = chai.expect;
const {compareData} = require("../shopifyCalls");
const {sortedProducts,sortedERPData} = require("./mockData");
const {sortData} = require('../utils/sortData');

function multiplyData(data,times,sortBy){
	let finalData = [];
	for(let i = 0; i < times;i++){
		for(let k = 0;k<data.length;k++){
			//data[k][sortBy] += k;
			finalData.push(JSON.parse(JSON.stringify(data[k])));
		}
	}

	let finalSortedData = sortData(finalData,sortBy);
	return finalSortedData;
}
//testing this function individually becuase it will be the choke point for the app
const postDataResult = [
	{"id":2,"name":"celox","images":["link1","link2"],"quantity":7,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"},
	{"id":3,"name":"pepsi","images":["link1","link2"],"quantity":5,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"},
	{"id":1,"name":"test product","images":["link1","link2"],"quantity":5,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"},
	{ id: 6,
       name: 'test producta',
       images: [ 'link1', 'link2' ],
       quantity: 5,
       lastModified: '26-jun-18',
       classCode: 'class 1',
       description: ' a description' } ];
const putDataResult = [{"id":4,"name":"CTOMS RASH GUARD \"EX COELIS\"","images":["link1","link2"],"quantity":8,"lastModified":"26-jun-18","classCode":"class 2","description":"ctoms rash guard"},{"id":5,"name":"M2-BELT™","images":["link1","link2"],"quantity":23,"lastModified":"26-jun-18","classCode":"class 2","description":" a description"}];
describe("Test output from compareData function", function(){
	let testSortedERPData = [];
	let testSortedShopifyData = [];
	beforeEach(function() {
		//do this to deep clone a simnple object
		testSortedERPData = JSON.parse(JSON.stringify(sortedERPData));
		testSortedShopifyData = JSON.parse(JSON.stringify(sortedProducts));
		console.log("==============START OF NEW TEST=====================")
  	});
	it("should run once",function(done){
		//expect(1).to.equal(1);
		let newData = compareData([{name:"a"},"time"],[{title:"a"},{title:"b"},"time"]);
		console.log(newData);
		expect(newData.returnPutData).to.deep.equal([{name:"a"}]);
		done();
	});


	it("should run once with current test data and report time",function(done){
		//set the timeout for this test to 10 seconds
		this.timeout(10000);
   		setTimeout(done, 10000);
   		//it takes about 1.4ms to run with current test data
   		console.time("onceTimer");
   		testSortedERPData.push("testTime");
   		testSortedShopifyData.push("testime");
   		let newData = compareData(testSortedERPData,testSortedShopifyData);
   		console.timeEnd("onceTimer")
   		expect(newData.returnPostData).to.deep.equal(postDataResult);
   		expect(newData.returnPutData).to.deep.equal(putDataResult);
		done();
	});
	
	it("should return the same data when run 100 times",function(done){
		//set the timeout for this test to 10 seconds
		this.timeout(10000);
   		setTimeout(done, 10000);
   		//it takes about 1.4ms to run with current test data
   		console.time("test_timer_1");
   		let newData = []
   		console.log(sortedProducts[0].productChecked);
   		for(let i = 0;i < 100;i++){
   			testSortedERPData = JSON.parse(JSON.stringify(sortedERPData));
			testSortedShopifyData = JSON.parse(JSON.stringify(sortedProducts));
			testSortedERPData.push("testTime");
   			testSortedShopifyData.push("testime");
   			newData =compareData(testSortedERPData,testSortedShopifyData);
   			expect(newData.returnPostData).to.deep.equal(postDataResult);
   			expect(newData.returnPutData).to.deep.equal(putDataResult);
   		}
   		console.timeEnd("test_timer_1")
   		expect(newData.returnPostData).to.deep.equal(postDataResult);
   		expect(newData.returnPutData).to.deep.equal(putDataResult);
		done();
	});
	
	it("testing runtime with 10x the data",function(done){
		//approx 95ms
		const multipliedERPData = multiplyData(sortedERPData,10,"name");
		const multipliedShopifyData = multiplyData(sortedProducts,10,"title");
		multipliedERPData.push("time");
		multipliedShopifyData.push("time");
		//console.log("multiplied erp data -------------",multipliedERPData);
		//console.log("multiplied shopify data -------------",multipliedShopifyData);
		//console.log("Multiplied erp length", multipliedERPData.length);
		//console.log("Multiplied shopify length", multipliedShopifyData.length);
		console.time("test_timer_2");
   		let newData = compareData(multipliedERPData,multipliedShopifyData);
   		console.timeEnd("test_timer_2");
   		//console.log(newData);
		done();
	});
	
	it("testing runtime with 900x the data, takes about 9 minutes and corresponds to 5401 mock ERP items and 7201 Shopify items, usues 7.73 gigs",function(done){
		this.timeout(50000);
   		setTimeout(done, 50000);
		const multipliedERPData = multiplyData(sortedERPData,900,"name");
		const multipliedShopifyData = multiplyData(sortedProducts,900,"title");
		multipliedERPData.push("time");
		multipliedShopifyData.push("time");
		console.time("test_timer_3");
   		let newData = compareData(multipliedERPData,multipliedShopifyData);
   		console.log(process.memoryUsage());	
   		console.timeEnd("test_timer_3");
   		console.log("multiplied erp data -------------",multipliedERPData.length);
		console.log("multiplied shopify data -------------",multipliedShopifyData.length);
   		//console.log(newData);
		done();
	});
	
});
	
