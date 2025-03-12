<?php
$filename = 'status.json';
$musicpath = './music';
$musicext = ['ogg','flac','wav'];
$defaultData=array(
	'status'=>'stop',
	'music'=>0,
	'path'=>'',
	'volume'=>1,
	'loop'=>1,
	'changed'=>false,
);
$statusData=array();
function loadData(){
	global $filename;
	global $defaultData;
	global $statusData;
	if(!file_exists($filename)){
		$handle = fopen($filename, 'w');
		$txt = json_encode($defaultData, JSON_UNESCAPED_UNICODE);
		fwrite($handle, $txt);
		fclose($handle);
	}
    $handle = fopen($filename, 'r');//读取二进制文件时，需要将第二个参数设置成'rb'
    //通过filesize获得文件大小，将整个文件一下子读到一个字符串中
    $contents = fread($handle, filesize ($filename));
	$statusData=json_decode($contents, true);
	$statusData=array_merge((array)$defaultData, (array)$statusData);
	fclose($handle);
	return $statusData;
}

function saveData(){
	global $filename;
	global $defaultData;
	global $statusData;
	$statusData=array_merge((array)$defaultData, (array)$statusData);
	$handle = fopen($filename, 'w');
	$txt = json_encode($statusData, JSON_UNESCAPED_UNICODE);
	fwrite($handle, $txt);
	fclose($handle);
	return true;
}

function getData(){
	global $statusData;
	$statusData=loadData();
	return $statusData;
}

function setData($key,$val){
	global $statusData;
	$statusData[$key]=$val;
	if($key=='path'){
		$statusData['music']=0;
	}
	$statusData['changed']=true;
	saveData();
	return $statusData;
}

function claimData(){
	global $statusData;
	$statusData['changed']=false;
	saveData();
	return $statusData;
}

function utf8ize($data) {
    if (is_array($data)) {
        return array_map('utf8ize', $data);
    } elseif (is_string($data)) {
        // return mb_convert_encoding($data, "UTF-8", "auto");
		// return iconv("GBK", "UTF-8//IGNORE", $data);
		// return iconv(mb_detect_encoding($data,['GBK','UTF-8']), "UTF-8", $data);
		$encoding = mb_detect_encoding($data, ["UTF-8", "GBK", "ISO-8859-1"], true);
		if ($encoding !== "UTF-8") {
			$data = iconv($encoding, "UTF-8", $data);
		}
		return $data;
    }
    return $data;
}

function is_list($array){
	if (!is_array($array)) return false;
    return array_keys($array) == range(0, count($array) - 1);
}

function getAlbumList(){
	global $musicpath;
	$folders = array_map('basename', glob("$musicpath/*", GLOB_ONLYDIR));
	return utf8ize($folders);
}

function getAlbumName($i){
	$albumList=getAlbumList();
	if($i < count($albumList)){
		return $albumList[$i];
	}else{
		return false;
	}
}
function getAlbumIndex($name){
	return array_search($name, getAlbumList());
}

function getMusicList(){
	global $musicpath;
	global $musicext;
	global $statusData;
	$files = [];
	loadData();
	foreach ($musicext as $ext) {
		$files = array_merge($files, utf8ize(glob("$musicpath/$statusData[path]/*.$ext")));
	}
	natsort($files);
	$fileList=array_values($files);
	for($i=0; $i<count($fileList); $i++){
		$fsp=explode('/',$fileList[$i]);
		$fileList[$i]=end($fsp);
	}
	return $fileList;
}

function getMusicIndex($name){
	return array_search($name, getMusicList());
}

function getMusicName($i){
	$musicList=getMusicList();
	if($i < count($musicList)){
		return $musicList[$i];
	}else{
		return false;
	}
}

if(isset($_GET) && isset($_GET['type'])){
	$result=loadData();
	switch($_GET['type']){
		case 'get': default:
			$result=getData();
		break;

		case 'album':
			$result=getAlbumList();
		break;

		case 'list':
			$result=getMusicList();
		break;

		case 'claim':
			$result=claimData();
		break;

		case 'play': case 'pause': case 'stop':
			$result=setData('status',$_GET['type']);
		break;

		case 'set':
			if(isset($_GET['album'])){ // album为专辑index
				$name=getAlbumName((int)$_GET['album']);
				if($name){
					$result=setData('path',$name);
				}
			}else if(isset($_GET['music'])){ // music为歌曲index
				$name=getMusicName((int)$_GET['music']);
				if($name){
					$result=setData('music',(int)$_GET['music']);
				}
			}else if(isset($_GET['volume'])){
				$result=setData('volume',(float)$_GET['volume']);
			}
			else if(isset($_GET['loop'])){
				$result=setData('loop',$_GET['loop']=='0'?0:1);
			}
		break;

		case 'prev': case 'next':
			$musicList=getMusicList();
			$curIndex=$statusData['music'];
			if($_GET['type']=='prev'){
				if($curIndex>0){
					$curIndex--;
				}else if($curIndex<=0 && $statusData['loop']==1){
					$curIndex=count($musicList)-1;
				}
			}else if($_GET['type']=='next'){
				if($curIndex<count($musicList)-1){
					$curIndex++;
				}else if($curIndex>=count($musicList)-1 && $statusData['loop']==1){
					$curIndex=0;
				}
			}
			$result=setData('music',$curIndex);
		break;
	}
	if($result!=''){
		if(isset($_GET['lsl']) && $_GET['lsl']=='1'){
			if(is_list($result)){
				exit(implode('|',$result));
			}else{
				exit(implode("|", array_map(function($k, $v){return "$k|$v";}, array_keys($result), $result)));
			}
		}else{
			exit(json_encode($result, JSON_UNESCAPED_UNICODE));
		}
	}
}else{
	exit(json_encode(getData(), JSON_UNESCAPED_UNICODE));
}
?>