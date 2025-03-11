<?php
$filename = 'status.json';
$musicpath = './music';
$musicext = ['ogg','flac','wav'];
$defaultData=array(
	'status'=>'stop',
	'music'=>0,
	'path'=>'',
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
	return array_values($files);
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
	$result='';
	loadData();
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
			}
		break;

		case 'prev': case 'next':
			$musicList=getMusicList();
			$curIndex=$statusData['music'];
			if($_GET['type']=='prev' && $curIndex>0){
				$curIndex--;
			}else if($_GET['type']=='next' && $curIndex<count($musicList)-1){
				$curIndex++;
			}
			$result=setData('music',$curIndex);
		break;
	}
	if($result!=''){
		if(isset($_GET['lsl']) && $_GET['lsl']=='1'){
			exit(implode('|',$result));
		}else{
			exit(json_encode($result, JSON_UNESCAPED_UNICODE));
		}
	}
}else{
	exit(json_encode(getData(), JSON_UNESCAPED_UNICODE));
}
?>