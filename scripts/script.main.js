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

let musicList=[];
async function getMusicList(){
	musicList=JSON.parse(await ajaxPromise(`control.php?type=list`));
	console.log(`Get Music List: `,musicList);
}

function getMusicName(music){
	let musicSp=music.split(`.`);
	musicSp.pop();
	return musicSp.join(`.`);
}

let curStatus;
let curAlbum;
let curMusic;
let curMusicName;
let curVolume;
async function applyStatusChange(force){
	// $(`.tapeCover`).html(JSON.stringify(statusData));
	if(statusData.changed || force){
		// Do something for status change
		if(statusData.path != curAlbum){
			curAlbum=statusData.path;
			await getMusicList();
		}
		if(statusData[`volume`] != curVolume){
			curVolume=statusData[`volume`];
			setVolume(curVolume);
		}
		if(statusData.music != curMusic){
			curMusic=statusData.music;
			curMusicName=getMusicName(musicList[curMusic]);
			
			initMusic(`music/${curAlbum}/${musicList[curMusic]}`);
			insertTape(`music/${curAlbum}/${curMusicName}.jpg`,curMusicName);
			setVolume(curVolume);
			if(statusData.status==`play`){
				playMusic();
			}
		}
		
		if(statusData.status != curStatus){
			curStatus=statusData.status;
			switch(curStatus){
				case `play`:
					playMusic();
					insertTape(`music/${curAlbum}/${curMusicName}.jpg`,curMusicName);
				break;
				case `pause`:
					playMusic(false);
					insertTape(`music/${curAlbum}/${curMusicName}.jpg`,curMusicName);
				break;
				case `stop`:
					stopMusic();
					removeTape();
				break;
			}
		}
		console.log(`Status Changed: `,statusData);
		claimStatusData().then(()=>{
			curStatus=statusData.status;
			curAlbum=statusData.path;
			curMusic=statusData.music;
			curVolume=statusData.volume;
			console.log(`Status Claimed.`);
		});
	}
}


let getStatusInterval;
async function applyGetStatus(){
	clearInterval(getStatusInterval);
	await getStatusData();
	await applyStatusChange(true);
	getStatusInterval=setInterval(()=>{
		getStatusData();
	},2000);
}

let currentName=``;
let currentLrc=``;
function setScreenStatus(name, time, lrc){
	let nn=name.split(`/`).at(-1) || `&nbsp;`;
	$(`#musicName`).html(nn);
	if(currentName!=nn){
		currentName=nn;
		new ScrollScreen(`.musicName`,false);
	}
	$(`#musicTime`).html(formatTime(time || 0));
	let ll;
	if(typeof lrc==`object` && lrc.length>0){
		let l=lrc.filter(r=>r.already==true).pop();
		ll=l.text;
	}else{
		ll=`&nbsp;`
	}
	$(`#musicLrc`).html(ll);
	if(currentLrc!=ll){
		currentLrc=ll;
		new ScrollScreen(`.musicLrc`,false);
	}
}

let scrollSpeed=8;
let scrollDelay=10;
let scrollInterval={};
class ScrollScreen{
	constructor(name, reverse=true){
		this.name=name;
		this.reverse=reverse;
		this.clear();
		this.scroll();
	}
	clear(){
		this.turn=0;
		this.delayTime=scrollDelay;
		$(this.name)[0].scrollLeft=0;
		clearInterval(scrollInterval[this.name]);
	}
	delay(){
		this.delayTime=scrollDelay;
	}
	scroll(){
		scrollInterval[this.name]=setInterval(()=>{
			if(this.delayTime>0){
				this.delayTime--;
				return;
			}
			let element=$(this.name)[0];
			if(this.turn==0){
				element.scrollLeft+=scrollSpeed;
			}else{
				if(this.reverse){
					element.scrollLeft-=scrollSpeed;
				}else{
					element.scrollLeft=0;
				}
			}
			let scrollMaxX = element.scrollWidth - element.clientWidth;
			if(element.scrollLeft >= scrollMaxX){
				this.turn=1;
				this.delay();
			}else if(element.scrollLeft <= 0){
				this.turn=0;
				this.delay();
			}
		},1000/10);
	}
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
	initTapeFrame(`#tapeMain`,false);


	setInterval(()=>{
		let vu=musicPlayer.getVu();
		$(`#vuL`).css(`width`,`${vu[0]}px`);
		$(`#vuR`).css(`width`,`${vu[1]}px`);
	},1000/60);
	// $(`.tapeLeft`).html(navigator.userAgent);
}

window.onload=function(){
	main();
}