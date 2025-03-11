let defaultStatusData={
	'status':'stop',
	'music':0,
	'path':'',
	'changed':false,
}
let statusData={
	...defaultStatusData,
};
async function getStatusData(){
	try{
		statusData={
			...defaultStatusData,
			...JSON.parse(await ajaxPromise(`control.php?type=get`)),
		};
		$(`.tapeCover`).html(JSON.stringify(statusData));
	}catch(e){
		console.error(e);
	}
	return statusData;
}


let getStatusInterval;
function applyGetStatus(){
	clearInterval(getStatusInterval);
	getStatusData();
	getStatusInterval=setInterval(()=>{
		getStatusData();
	},5000);
}

function applyButtonEvents(){

}

function main(){
	applyGetStatus();
	applyButtonEvents();
	$(`.tapeLeft`).html(navigator.userAgent);
}

window.onload=function(){
	main();
}