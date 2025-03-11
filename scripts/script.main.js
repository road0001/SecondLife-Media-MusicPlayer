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
		applyStatusChange();
	}catch(e){
		console.error(e);
	}
	return statusData;
}

async function claimStatusData(){
	try{
		statusData={
			...defaultStatusData,
			...JSON.parse(await ajaxPromise(`control.php?type=claim`)),
		};
	}catch(e){
		console.error(e);
	}
	return statusData;
}

async function setStatusData(key, val){
	try{
		statusData={
			...defaultStatusData,
			...JSON.parse(await ajaxPromise(`control.php?type=set&${key}=${val}`)),
		};
		applyStatusChange();
	}catch(e){
		console.error(e);
	}
}

async function setPlay(sta){
	try{
		statusData={
			...defaultStatusData,
			...JSON.parse(await ajaxPromise(`control.php?type=${sta}`)),
		};
	}catch(e){
		console.error(e);
	}
}

let curStatus=``;
let curAlbum=``;
let curMusic=0;
async function applyStatusChange(){
	$(`.tapeCover`).html(JSON.stringify(statusData));
	if(statusData.changed){
		// Do something for status change
		claimStatusData().then(()=>{
			curStatus=statusData.status;
			curMusic=statusData.music;
		});
	}
}


let getStatusInterval;
function applyGetStatus(){
	clearInterval(getStatusInterval);
	getStatusData();
	applyStatusChange();
	getStatusInterval=setInterval(()=>{
		getStatusData();
	},2000);
}

function applyButtonEvents(){
	$(`#controlBu_pause`).bind(`click`,function(){
		setPlay(`pause`);
	});
	$(`#controlBu_eject`).bind(`click`,function(){
		setPlay(`stop`);
	});
	$(`#controlBu_prev`).bind(`click`,function(){
		setPlay(`prev`);
	});
	$(`#controlBu_next`).bind(`click`,function(){
		setPlay(`next`);
	});
	$(`#controlBu_play`).bind(`click`,function(){
		setPlay(`play`);
	});
}

function main(){
	applyGetStatus();
	applyButtonEvents();
	$(`.tapeLeft`).html(navigator.userAgent);
}

window.onload=function(){
	main();
}