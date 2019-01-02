const chai = require('chai');
const expect = chai.expect;
const {compareData} = require("../shopifyCalls");



describe("Test output from compareData function", function(){
	let putData = [];
	let postData = [];

	beforeEach(function() {
		//console.log(seedData);
		putData = [1];
		postData = [];
  	});
	it("should run once",function(done){
		expect(1).to.equal(1);
		compareData([1],[1,2]);
		done();
	});
})
	
