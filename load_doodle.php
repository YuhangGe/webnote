<?php
header("Content-Type: text/plain;charset=utf-8");

function uchr($codes) {
	if(is_scalar($codes)) {
	$codes=func_get_args();
	}
	$str='';
	foreach($codes as $code) {
		$str.= mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES");
	}
	return $str;
}

function reverce_int($num) {
	//echo (($num & 0xff000000)>>24) & 0x000000ff;
	return ((($num & 0x000000ff)<<24) & 0xff000000) | ((($num & 0x0000ff00)<<8) & 0x00ff0000) | ((($num & 0x00ff0000)>>8) & 0x0000ff00) | ((($num & 0xff000000)>>24) & 0x000000ff);
}

function read_tlv($file) {
	if (feof($file)) {
		//echo 'eof';
		return false;
	}

	$type = unpack("l*", fread($file, 4));
	if (count($type) == 0) {
		return false;
	}
	//print_r($type);
	$type = reverce_int($type[1]);

	//printf("type: %s<br/>", dechex($type));

	$size = unpack("l*", fread($file, 4));
	$size = reverce_int($size[1]);
	if ($size > 0) {
		//	 printf("read dir size:%s(%d)<br/>",dechex($size),$size);
		$data = fread($file, $size);
	} elseif ($size < 0) {
		$tmp = $size & 0xff000000;
		$size &= 0x00ffffff;
		//	 printf("read size:%s(%d)<br/>",dechex($size),$size);
		$data = fread($file, $size);
		//  printf("tmp-:0x%08X<br/>",$tmp);
		switch ($tmp) {
			case (int)0x9f000000 :
			//echo strlen($data)." ";
			// $data = str_replace("\xEF\xBF\xBC", "", $data);
				//echo mb_strlen($data, 'utf8') . " ";
				//$data = mb_convert_encoding($data, "ascii",'utf8');
				//print_r($data);
				//echo "<br/>";
				break;
			case (int)0x91000000 :
			//short[]
		//	printf("size:%d",$size);
				$data = _2short_arr($data); //unpack("n*", $data);
					//print_r($data);
				break;
			case (int)0x81000000 :
				$data = _2short($data);
				//printf("short:%d\n",$data);
				break;
			case (int)0x82000000 :
			// print_r($data);
			
				$data = _2int($data);
				
				// printf("int:0x%08X(%d)<br/>",$data,$data);
				break;
			case (int)0x84000000:
				$data = _2long($data);
				break;
			case (int)0x83000000:
				$data = _2float($data);
				
				//print($data."\n");
				break;
		
			case (int)0x93000000:
				//float[]
				//printf("size:%d\n",$size);
				$data = _2float_arr($data);
				//print_r($data);
				break;
			case (int)0x92000000:
				//int[]
				$data = _2int_arr($data);
				break;
			default :
				//echo 'no';
				break;
		}

	} else {
		$data = null;
	}

	//echo $type.",".$size."<br/>";

	return array('type' => $type, 'length' => $size, 'value' => $data);
}

function _2float_arr($data){
	$arr=array();
	//printf("fa:%d\n",strlen($data));
	for($i=0;$i<strlen($data)/4;$i++){
		$tmp = substr($data, $i*4,4);
		$arr[]=_2float($tmp);
	}
	return $arr;
}
function _2float($data){
	$tmp = $data[0];
	$data[0] = $data[3];
	$data[3] = $tmp;
	$tmp = $data[1];
	$data[1] = $data[2];
	$data[2] = $tmp;
	$tmp =  unpack("f*", $data);
	return round($tmp[1],3);
}
function _2short($data){
	$tmp = unpack("C*", $data);
	return ($tmp[2] & 0x000000ff)|(($tmp[1]<<8)&0x0000ff00);
}
function _2int($data) {
	$tmp = unpack("C*", $data);
	//	print_r($tmp);
	return ($tmp[4] & 0x000000ff) | (($tmp[3]<<8) & 0x0000ff00) | (($tmp[2]<<16) & 0x00ff0000) | (($tmp[1]<<24) & 0xff000000);
	//return (($tmp[1]>>24)&0x000000ff)|(($tmp[2]>>8)&0x00ff0000)|(($tmp[3]<<8)&0x0000ff00)|(($tmp[4]<<24)&0xff000000);
}
function _2int_arr($data){
	$arr = array();
	for($i=0;$i<strlen($data)/4;$i++){
		$tmp = substr($data,$i*4,4);
		$arr[] = _2int($tmp);
	}
	return $arr;
}
function _2long($data){
	//echo strlen($data);
	//$tmp = unpack("C*",$data);
	//print_r($tmp);
	return 0;
}
function _2short_arr($data){
	$tmp = unpack("C*",$data);
	//printf("si2:%d",count($tmp));
	$rtn = array();
	for($i=1;$i<=count($tmp);$i+=2){
		$n = (($tmp[$i]<<8)&0x0000ff00)|($tmp[$i+1]&0x000000ff);
		$rtn[] = $n;
		//printf("%02X,",$n);
	}
	//printf("s3:%d,",count($rtn));
	return $rtn;
}

function clr2chr($color) {
	//print_r($color);
	return uchr(($color>>16)&0x000000ff,($color>>8)&0x000000ff,$color&0x000000ff);
}

function err($msg) {
	echo "<div style='color:red;'>" . $msg . "</div>";
}


if(empty($_REQUEST['file']))
	$file_name = "adb/";
else
	$file_name = $_REQUEST['file'];

if (!file_exists($file_name."doodle_items")) {
	echo "no file";
	exit(-1);
}


$file = fopen($file_name."doodle_items", "rb");

read_tlv($file); //doodle begin
$panel_width = read_tlv($file); //画布宽

$panel_height = read_tlv($file);//画布高
$page_id = read_tlv($file);//page id

read_tlv($file);//阵列begin



function read_doodle_list($file,$end){
	$doodle_list = array();
	
	while ($tlv = read_tlv($file)) {
		if($tlv['type']==$end){
			//阵列结束
			break;
		}
		elseif ($tlv['type'] == (int)0x04070000) {
			//图片doodle
			//printf("image/n");
			read_tlv($file);//base begin;
			$p_base = read_base_tlv($file);
			$p_name = read_tlv($file);
			$p_matrix = read_tlv($file);
			
			read_tlv($file);//pic end;
			$doodle_list[] = array('type'=>'image','base'=>$p_base,'file_name'=>$p_name['value'],'matrix'=>$p_matrix['value']);
	
		} elseif ($tlv['type'] == (int)0x04050000) {
			//群组doodle
			read_tlv($file);//base begin
			$q_base = read_base_tlv($file);
		//	printf("type %d\n",$q_base['type']);
			$q_base['type'] = 11;
			$q_zorder = read_tlv($file);
			read_tlv($file);//list begin
			$q_list = read_doodle_list($file, (int)0x0406FFFF);
			
			$doodle_list[] = array('type'=>'group','base'=>$q_base,'zorder'=>$q_zorder['value'],'list'=>$q_list);
			
		} elseif ($tlv['type'] == (int)0x04080000) {
			//点类doodle
			
			read_tlv($file);//base begin
			$d_base = read_base_tlv($file);
			$d_list = read_tlv($file);
			read_tlv($file);//点类end
				
			$doodle_list[] = array('type'=>'point','base'=>$d_base,'point_arr'=>$d_list['value']);
				
		}

	}

	return $doodle_list;
}

function read_base_tlv($file){
	 
	$type = read_tlv($file);//type
	$w = read_tlv($file);//width
	$c = read_tlv($file);//color
	
	$rtn_type = array('type'=>$type['value'],'width'=>$w['value'],'color'=>$c['value'],'eraser_list'=>array());
	
	read_tlv($file);//eraser list begin
	
	while($tlv = read_tlv($file)){
		$t = $tlv['type'];
		if($t==(int)0x0403FFFF){
			//eraser list end
			break;
		}elseif($t==(int)0x04040000){
			//eraser
			read_tlv($file);//点类 begin
			read_tlv($file);//base begin
			$d_base = read_base_tlv($file);
			$d_list = read_tlv($file);
			read_tlv($file);//点类end
			
			$rtn_type['eraser_list'][] = array('type'=>'point','base'=>$d_base,'point_arr'=>$d_list['value']);
			
			read_tlv($file);//eraser end
		}
		
	}
	
	read_tlv($file);//基本物件 end
	
	return $rtn_type;
	
	
}


function hw2str($h){
	$out = "";
	
	$out.= uchr($h['index'],$h['width'],$h['height'],$h['weight']).clr2chr($h['color']).uchr(count($h['bihua']));
	
	//printf("%d\n",count($h['bihua']));
	for($i=0;$i<count($h['bihua']);$i++){
		
		$b = $h['bihua'][$i];
		$out.=uchr(count($b)/2);
		for($j=0;$j<count($b)/2;$j++){
			//printf("%d,%d  ",$b[$j],$b[$j+1]);
			$out.= uchr($b[$j*2],$b[$j*2+1]);	
		}
	}
	
	return $out;
}

function encode_float($f){
	$t = $f."";
	return uchr(strlen($t)).$t;
}
function encode_base($b){
	$rtn = uchr($b['type']).encode_float($b['width']).clr2chr($b['color']);
	$e_list = $b['eraser_list'];
	$rtn.= uchr(count($e_list));
	for($i=0;$i<count($e_list);$i++){
		$rtn.=encode_float($e_list[$i]['base']['width']);
		$ps = $e_list[$i]['point_arr'];
		$rtn.=uchr(count($ps)/2);
		for($j=0;$j<count($ps);$j+=2){
			$rtn.=uchr($ps[$j],$ps[$j+1]);
		}
	}
	return $rtn;
}
function encode_point($p){
	
}
function encode_image_file($fn){
	global $file_name;
	//echo $file_name.$fn;
	if(!file_exists($file_name.$fn)){
		echo "not find file!";
		return uchr(0);
	}
	
	$dr = base64_encode(file_get_contents($file_name.$fn));
	$len = strlen($dr);
	$h = (($len & 0xffff0000)>>16)&0x0000ffff;
	$l = $len & 0x0000ffff;
	//printf("len:%d,h:%d,l:%d\n\n",$len,$h,$l);
	return uchr($h,$l).$dr;
}


function encode_doodle($d){
	$b = $d['base'];
	$output= encode_base($b);
	if($d['type']=='point'){
		//点类
		$ps = $d['point_arr'];
		$output.=uchr(count($ps)/2);
		for($i=0;$i<count($ps);$i+=2){
			$output.= uchr($ps[$i],$ps[$i+1]);
		}
	}elseif($d['type']=='image'){
		$fn = $d['file_name'];
		$output.= encode_image_file($fn);
		$m = $d['matrix'];
		for($i=0;$i<9;$i++){
			$output.=encode_float($m[$i]);
		}
	}elseif($d['type']=='group'){
		$output.= uchr(count($d['list']));
		foreach($d['list'] as $l_d){
			$output.=encode_doodle($l_d);
		}
	}
	return $output;
}

$doodle_list = read_doodle_list($file, (int)0x0401FFFF);
fclose($file);

$output = "";

$output.= uchr($panel_width['value'],$panel_height['value'],$page_id['value'],count($doodle_list));


foreach($doodle_list as $d){
	$output.= encode_doodle($d);
}
print_r($doodle_list);

echo $output;
?>
