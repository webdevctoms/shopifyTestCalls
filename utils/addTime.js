const addSeconds = function(time,inc){
	let finalTime = time + inc;
	if(finalTime > 60){
		finalTime -= 60;
	}

	return finalTime;
};

const addTime = function(time,inc){
	let finalTime = time + inc;

	return finalTime;
};


const subtractTime = function(time1,time2,currentTime){
	const diff1 = Math.abs(currentTime - time1);
	const diff2 = Math.abs(currentTime - time2);

	if(diff1 > diff2){
		//if time 1 took less time than time 2
		return false
	}
	else{
		//if time 2 took less time or equal time than time1
		return true
	}
}

module.exports = {addSeconds,subtractTime,addTime};