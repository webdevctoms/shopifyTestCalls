//use this to sort data from ERP, shopify seems to already be sorted
//might not need this if ERP data sorted
const sortData = function(arr,sortName){
	return arr.sort((a,b) => {
		if(a[sortName].toLowerCase() > b[sortName].toLowerCase() ){
			return 1;
		}
		if(a[sortName].toLowerCase()  < b[sortName].toLowerCase() ){
			return -1;
		}
	});
};

module.exports = {sortData};