let tapeFPS=60;
let tapeProcess=0;
let tapeScale=0;
let bandWidth=0;
let tapeSpeed=0;
let scaleRange=[0.4,1];
// let speedRange=[0.75,1.5];
let speedRange=[2,4];
let wheelSpeed=6;
let bandWidthRange=[176, 22];
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
	bandWidth=getVal(tapeProcess,bandWidthRange);
	tapeSpeed=getVal(tapeProcess,speedRange);
}

function setForward(rate){
	if(rate==undefined) rate=1;
	forwardRate=rate;
}

let angleMaster=0;
let angleSlave=0;
let angleNormal=0;
let angleNormalR=0;
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
		let bandWidthR=getVal(1-tapeProcess,bandWidthRange);
		// 左侧
		$(`.tapeRoll.left`).find(`.rotate`).css({
			transform:`rotate(${angleMaster}deg)`
		});
		$(`.tapeRoll.left`).find(`.rotateNormal`).css({
			transform:`rotate(${angleNormal}deg)`
		});
		$(`.tapeRoll.left`).find(`.scale`).css({
			transform:`scale(${tapeScaleR})`
		});
		$(`.tapeRoll.left`).find(`.scaleX`).css({
			width:`${bandWidthR}px`
		});
		$(`.tapeRoll.left`).find(`.rotate.scale`).css({
			transform:`rotate(${angleMaster}deg) scale(${tapeScaleR})`
		});
		// 右侧
		$(`.tapeRoll.right`).find(`.rotate`).css({
			transform:`rotate(${angleSlave}deg)`
		});
		$(`.tapeRoll.right`).find(`.rotateNormal`).css({
			transform:`rotate(${angleNormal}deg)`
		});
		$(`.tapeRoll.right`).find(`.scale`).css({
			transform:`scale(${tapeScale})`
		});
		$(`.tapeRoll.right`).find(`.scaleX`).css({
			width:`${bandWidth}px`
		});
		$(`.tapeRoll.right`).find(`.rotate.scale`).css({
			transform:`rotate(${angleSlave}deg) scale(${tapeScale})`
		});
		// 外侧
		$(`.tapeBody`).find(`.rotateNormal`).css({
			transform:`rotate(${angleNormal}deg)`
		});
		$(`.tapeBody`).find(`.rotateNormalR`).css({
			transform:`rotate(${angleNormalR}deg)`
		});
		if(isRotating){
			$(`.tapeBody`).find(`.tapeBaseMachine.reader`).removeClass(`idle`);
			angleMaster-=tapeSpeed*playRate;
			angleSlave-=tapeSpeedR*playRate;
			angleNormal-=wheelSpeed*playRate;
			angleNormalR+=wheelSpeed*playRate;
			// if(angleMaster<-360) angleMaster=0;
			// if(angleSlave<-360) angleSlave=0;
		}else{
			$(`.tapeBody`).find(`.tapeBaseMachine.reader`).addClass(`idle`);
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
			{tag:`div`,class:`tape tapeBand bottom`},
			{tag:`div`,class:`tapeRoll left`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`},
				{tag:`div`,class:`tape tapeBand scaleX`,html:`<svg width="100%" height="100%"><line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="2" /></svg>`},
				{tag:`div`,class:`tape tapeWheel rotateNormal`},
				{tag:`div`,class:`machine tapeGearMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},
			{tag:`div`,class:`tapeRoll right`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`},
				{tag:`div`,class:`tape tapeBand scaleX`,html:`<svg width="100%" height="100%"><line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="2" /></svg>`},
				{tag:`div`,class:`tape tapeWheel rotateNormal`},
				{tag:`div`,class:`tapeGearMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},

			{tag:`div`,class:`tapeBaseMachine shaft rotateNormal`},
			{tag:`div`,class:`tapeBaseMachine reader idle head`},
			{tag:`div`,class:`tapeBaseMachine reader idle wheel rotateNormalR`},
			{tag:`div`,class:`tapeBaseMachine reader idle wheelRack`},
			
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