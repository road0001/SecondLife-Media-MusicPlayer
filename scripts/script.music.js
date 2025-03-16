let musicPlayer;
function initMusic(music){
	console.log(`Init Music: `,music);
	$(`audio`).remove();
	musicPlayer=new Audio(music);
	musicPlayer.init();
	musicPlayer.loadLrc(music);

	musicPlayer.oncanplay=function(){
		console.log(`Ready to play!`);
	}
	musicPlayer.addEventListener(`timeupdate`,function(){
		this.process=this.currentTime/this.duration;
		this.setLrc(this.currentTime);
		setScreenStatus(getMusicName(music), this.currentTime, this.lrcList);
		setTapeProcess(this.process);
		if(this.paused){
			setTapeProcess(false);
			if(this.currentTime==0){
				setScreenStatus();
			}
		}
	});
	musicPlayer.addEventListener(`ended`, () => {
		setPlay(`next`);
	});
	document.body.appendChild(musicPlayer);
}

function playMusic(bool){
	if(!musicPlayer) return;
	if(bool==undefined) bool=true;
	if(bool){
		try{
			musicPlayer.play();
		}catch(e){
			console.error(e);
		}
	}else{
		musicPlayer.pause();
	}
}

function stopMusic(){
	if(musicPlayer){
		musicPlayer.pause();
		musicPlayer.currentTime=0;
	}
}

function setVolume(v){
	if(musicPlayer){
		musicPlayer.volume=v;
	}
}

function setMuted(bool){
	if(bool==undefined) bool=true;
	if(musicPlayer){
		musicPlayer.muted=bool;
	}
}

Audio.prototype.init = function(){
	let $this = this;
	// $this.context = new AudioContext();
	// $this.source = $this.source || $this.context.createMediaElementSource($this);
	// $this.source.connect($this.context.destination);
	$this.process = 0;
	// $this.setAttribute(`autoplay`,true);
	// $this.setAttribute(`controls`,true);

	const audio = $this;
	// 2️⃣ 创建 AudioContext
	const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	const analyserL = audioCtx.createAnalyser();
    const analyserR = audioCtx.createAnalyser();
	analyserL.fftSize = analyserR.fftSize = 256; // 设定 FFT 分辨率
	// 创建音频源
    const source = audioCtx.createMediaElementSource(audio);
	// 拆分左右声道
    const splitter = audioCtx.createChannelSplitter(2);
    source.connect(splitter);
    splitter.connect(analyserL, 0); // 左声道
    splitter.connect(analyserR, 1); // 右声道
	// 连接到输出（否则听不到声音）
    const merger = audioCtx.createChannelMerger(2);
    analyserL.connect(merger, 0, 0);
    analyserR.connect(merger, 0, 1);
    merger.connect(audioCtx.destination);

	$this.analyserL=analyserL;
	$this.analyserR=analyserR;
};

Audio.prototype.getVu = function(){
	// 创建数据缓冲区
    const bufferLength = this.analyserL.frequencyBinCount;
    const dataArrayL = new Uint8Array(bufferLength);
    const dataArrayR = new Uint8Array(bufferLength);
	this.analyserL.getByteFrequencyData(dataArrayL);
	this.analyserR.getByteFrequencyData(dataArrayR);
	// 计算左声道平均音量
	let sumL = dataArrayL.reduce((acc, val) => acc + val, 0);
	let volumeL = sumL / dataArrayL.length;
	// 计算右声道平均音量
	let sumR = dataArrayR.reduce((acc, val) => acc + val, 0);
	let volumeR = sumR / dataArrayR.length;

	return [volumeL, volumeR];
}

Audio.prototype.loadLrc = function(music){
	let $this=this;
	$this.lrcList=[];
	let lrcUrl=`${getMusicName(music)}.lrc`;
	const regex = /\[(\d{2}:\d{2}\.\d{2})\](.*)/;
	ajaxPromise(lrcUrl).then((rs)=>{
		let lrcList=rs.replaceAll(`\r`,``).split(`\n`);
		lrcList=lrcList.map((line)=>{
			const match = line.match(regex);
			if (match) {
				let [min, sec] = match[0].replaceAll(`[`,``).replaceAll(`]`,``).split(`:`);
				let second=parseInt(min) * 60 + parseFloat(sec);
				return {
					time: match[1].trim(),
					second:second,
					text: match[2].trim(),
					already:false,
				};
			}else{
				return {};
			}
		});
		$this.lrcList=lrcList;
	}).catch((e)=>{
		$this.lrcList=[];
	});
}
Audio.prototype.setLrc = function(time){
	let currentLine = this.lrcList.filter(line => time >= line.second).pop();
	if (currentLine) {
        currentLine.already=true;
		return currentLine;
    }
}