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