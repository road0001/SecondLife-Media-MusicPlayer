let statusData;
let getStatusInterval;
function applyGetStatus(){
	clearInterval(getStatusInterval);
	getStatusInterval=setInterval(()=>{
		ajaxPromise(`control.php?type=get`).then((rs)=>{
			statusData=JSON.parse(rs);
			$(`.tapeCover`).html(JSON.stringify(statusData));
		});
	},1000);
}

function main(){
	applyGetStatus();
}

window.onload=function(){
	main();
}