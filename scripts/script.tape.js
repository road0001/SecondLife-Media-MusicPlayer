let tapeFPS=60;
let tapeProcess=0;
let tapeScale=0;
let tapeSpeed=0;
let scaleRange=[0.4,1];
// let speedRange=[0.75,1.5];
let speedRange=[2,4];
let isRotating=false;
let isReverse=false;
let forwardRate=1;

function getVal(percent, range) {
	const [min, max] = range;
	return min + (max - min) * percent;
}

function setScaleMax(max){
	if(max>1) max=1;
	if(max<scaleRange[0]) max=scaleRange[0];
	scaleRange[1]=max;
}

function setTapeProcess(p){
	if(p===false){
		isRotating=false;
		return;
	}
	if(p!=undefined){
		tapeProcess=Math.abs(p);
		if(p<0){
			isReverse=true;
		}else{
			isReverse=false;
		}
	}
	isRotating=true;
	if(tapeProcess>1) tapeProcess=1;
	if(tapeProcess<0) tapeProcess=0;
	tapeScale=getVal(tapeProcess,scaleRange);
	tapeSpeed=getVal(tapeProcess,speedRange);
}

function setForward(rate){
	if(rate==undefined) rate=1;
	forwardRate=rate;
}

let angleMaster=0;
let angleSlave=0;
let playAnimInterval;
function playAnim(){
	clearInterval(playAnimInterval);
	playAnimInterval=setInterval(()=>{
		let playRate=forwardRate;
		if(isReverse){
			playRate*=-1;
		}
		let tapeScaleR=getVal(1-tapeProcess,scaleRange);
		let tapeSpeedR=getVal(1-tapeProcess,speedRange);
		$(`.tapeRoll.left`).find(`.rotate`).css({
			transform:`rotate(${angleMaster}deg)`
		});
		$(`.tapeRoll.left`).find(`.scale`).css({
			transform:`scale(${tapeScaleR})`
		});
		$(`.tapeRoll.left`).find(`.rotate.scale`).css({
			transform:`rotate(${angleMaster}deg) scale(${tapeScaleR})`
		});
		$(`.tapeRoll.right`).find(`.rotate`).css({
			transform:`rotate(${angleSlave}deg)`
		});
		$(`.tapeRoll.right`).find(`.scale`).css({
			transform:`scale(${tapeScale})`
		});
		$(`.tapeRoll.right`).find(`.rotate.scale`).css({
			transform:`rotate(${angleSlave}deg) scale(${tapeScale})`
		});
		if(isRotating){
			angleMaster-=tapeSpeed*playRate;
			angleSlave-=tapeSpeedR*playRate;
			// if(angleMaster<-360) angleMaster=0;
			// if(angleSlave<-360) angleSlave=0;
		}
	},1000/tapeFPS);
	
	// requestAnimationFrame(playAnim);
}

function insertTape(cover,name){
	if(!name) name=``;
	$(`.tapeCoverText`).html(name);
	$(`.tapeCover.image`).css(`background-image`,`url('${cover}')`);
	$(`.tape`).css(`visibility`,``);
	setTapeProcess(false);
	setForward();
}

function removeTape(){
	$(`.tape`).css(`visibility`,`hidden`);
	setTapeProcess(0);
	setTapeProcess(false);
	setForward();
}

function initTapeFrame(id, reverse=false){
	$(id).html(``);
	let reverseClass=(reverse==true)?`reverse`:``;
	$(id).appendDOM(
		{tag:`div`,class:`tapeBody ${reverseClass}`,children:[
			{tag:`div`,class:`tapeRoll left`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`},
				{tag:`div`,class:`machine tapeGearMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},
			{tag:`div`,class:`tapeRoll right`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`,style:{transform:`scale(20%)`}},
				{tag:`div`,class:`tapeGearMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},
			{tag:`div`,class:`machine tapeBaseMachine`},
			{tag:`div`,class:`tape tapeBaseProcess`},
			{tag:`div`,class:`tape tapeCover text`,children:[
				{tag:`button`,class:`tapeCoverText`,html:``}
			]},
			{tag:`div`,class:`tape tapeCover image`},
			{tag:`div`,class:`tape tapeBase ${reverseClass}`},
		]}
	);
	setTapeProcess(false);
	removeTape();
	playAnim();
}