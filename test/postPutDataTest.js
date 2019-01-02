const chai = require('chai');
const expect = chai.expect;
const {compareData} = require("../shopifyCalls");
const {sortedProducts,sortedERPData} = require("./mockData");

function multiplyData(data,times){
	let finalData = [];
	for(let i = 0; i < times;i++){
		for(let i = 0;i<data.length;i++){
			finalData.push(JSON.parse(JSON.stringify(data[i])));
		}
	}

	return finalData;
}
//testing this function individually becuase it will be the choke point for the app
const postDataResult = [{"id":2,"name":"celox","images":["link1","link2"],"quantity":7,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"},{"id":3,"name":"pepsi","images":["link1","link2"],"quantity":5,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"},{"id":1,"name":"test product","images":["link1","link2"],"quantity":5,"lastModified":"26-jun-18","classCode":"class 1","description":" a description"}];
const putDataResult = [{"id":4,"name":"CTOMS RASH GUARD \"EX COELIS\"","images":["link1","link2"],"quantity":8,"lastModified":"26-jun-18","classCode":"class 2","description":"ctoms rash guard"},{"id":5,"name":"M2-BELT™","images":["link1","link2"],"quantity":23,"lastModified":"26-jun-18","classCode":"class 2","description":" a description"}];
describe("Test output from compareData function", function(){
	let testSortedERPData = [];
	let testSortedShopifyData = [];
	beforeEach(function() {
		//do this to deep clone a simnple object
		testSortedERPData = JSON.parse(JSON.stringify(sortedERPData));
		testSortedShopifyData = JSON.parse(JSON.stringify(sortedProducts));
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
		const multipliedERPData = multiplyData(sortedERPData,10);
		const multipliedShopifyData = multiplyData(sortedProducts,10);
		//console.log("multiplied erp data -------------",multipliedERPData);
		//console.log("multiplied shopify data -------------",multipliedShopifyData);
		console.log("Multiplied erp length", multipliedERPData.length);
		console.log("Multiplied shopify length", multipliedShopifyData.length);
		console.time("onceTimer");
   		let newData = compareData(multipliedERPData,multipliedShopifyData);
   		console.timeEnd("onceTimer")
		done();
	})
});
	
