function ajaxPromise(url, type=`GET`, post){
	return new Promise((resolve, reject)=>{
		$.ajax({
			url: url,
			type: type,
			data: post,
			headers:{
				accept:`text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01`,
			},
			success: function(rs){
				resolve(rs);
			},
			error: function(rs){
				reject(rs);
			}
		});
	});
}

String.prototype.replaceAll=function(org,tgt){
	return this.split(org).join(tgt);
}

String.prototype.count=function(str){
	return this.split(str).length-1;
}

function formatTime(seconds) {
	seconds=parseInt(seconds);
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function _GET(arg) {
	var url = location.search; //获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
		}
	}
	if(arg!=undefined){
		return theRequest[arg];
	}else{
		return theRequest;
	}
}