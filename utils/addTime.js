const addSeconds = function(time,inc){
	let finalTime = time + inc;
	if(finalTime > 60){
		finalTime -= 60;
	}

	return finalTime;
};

module.exports = {addSeconds};