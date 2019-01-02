const chai = require('chai');
const expect = chai.expect;
const {compareData} = require("../shopifyCalls");
const {sortedProducts,sortedERPData} = require("./mockData");

//testing this function individually becuase it will be the choke point for the app
describe("Test output from compareData function", function(){

	beforeEach(function() {

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
   		//it takes about 2.5ms to run with current test data
   		console.time("onceTimer");
   		let newData = compareData(sortedERPData,sortedProducts);
   		newData = compareData(sortedERPData,sortedProducts);
   		console.timeEnd("onceTimer")
		done();
	});
});
	
