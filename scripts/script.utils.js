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