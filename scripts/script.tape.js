let process=0;
let scale=0;
let speed=0;
let scaleRange=[0.4,1];
// let speedRange=[0.75,1.5];
let speedRange=[2,4];
let isRotating=false;

function getVal(percent, range) {
	const [min, max] = range;
	return min + (max - min) * percent;
}

function setProcess(p){
	if(p===false){
		isRotating=false;
		return;
	}
	if(p!=undefined){
		process=p;
	}
	isRotating=true;
	if(process>1) process=1;
	if(process<0) process=0;
	scale=getVal(process,scaleRange);
	speed=getVal(process,speedRange);
}

let angleMaster=0;
let angleSlave=0;
let playAnimInterval;
function playAnim(){
	clearInterval(playAnimInterval);
	playAnimInterval=setInterval(()=>{
		if(isRotating){
			scaleR=getVal(1-process,scaleRange);
			speedR=getVal(1-process,speedRange);
			$(`.tapeRoll.left`).find(`.rotate`).css({
				transform:`rotate(${angleMaster}deg)`
			});
			$(`.tapeRoll.left`).find(`.scale`).css({
				transform:`scale(${scaleR})`
			});
			$(`.tapeRoll.left`).find(`.rotate.scale`).css({
				transform:`rotate(${angleMaster}deg) scale(${scaleR})`
			});
			$(`.tapeRoll.right`).find(`.rotate`).css({
				transform:`rotate(${angleSlave}deg)`
			});
			$(`.tapeRoll.right`).find(`.scale`).css({
				transform:`scale(${scale})`
			});
			$(`.tapeRoll.right`).find(`.rotate.scale`).css({
				transform:`rotate(${angleSlave}deg) scale(${scale})`
			});
			angleMaster-=speed;
			angleSlave-=speedR;
			// if(angleMaster<-360) angleMaster=0;
			// if(angleSlave<-360) angleSlave=0;
		}
	},1000/60);
	
	// requestAnimationFrame(playAnim);
}

function insertTape(cover){
	$(`.tapeCover`).css(`background-image`,`url('${cover}')`);
	$(`.tape`).css(`visibility`,``);
}

function removeTape(){
	$(`.tape`).css(`visibility`,`hidden`);
}

function initTapeFrame(id, reverse=false){
	$(id).html(``);
	let reverseClass=(reverse==true)?`reverse`:``;
	$(id).appendDOM(
		{tag:`div`,class:`tapeBody ${reverseClass}`,children:[
			{tag:`div`,class:`tapeRoll left`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`},
				{tag:`div`,class:`tapeMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},
			{tag:`div`,class:`tapeRoll right`,children:[
				{tag:`div`,class:`tape tapeVolume rotate scale`,style:{transform:`scale(20%)`}},
				{tag:`div`,class:`tapeMachine rotate`},
				{tag:`div`,class:`tape tapeGear rotate`},
				{tag:`div`,class:`tape tapeMaterial scale`},
			]},
			{tag:`div`,class:`tape tapeBaseProcess`},
			{tag:`div`,class:`tape tapeCover`},
			{tag:`div`,class:`tape tapeBase ${reverseClass}`},
		]}
	);
	setProcess(false);
	removeTape();
	playAnim();
}