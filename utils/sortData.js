//use this to sort data from ERP, shopify seems to already be sorted
//might not need this if ERP data sorted
const sortData = function(arr){
	return arr.sort((a,b) => {
		if(a.name.toLowerCase() > b.name.toLowerCase() ){
			return 1;
		}
		if(a.name.toLowerCase()  < b.name.toLowerCase() ){
			return -1;
		}
	});
};

module.exports = {sortData};